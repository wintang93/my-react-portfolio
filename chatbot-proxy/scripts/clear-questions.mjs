// Delete every logged question from the NOVEL_QUESTIONS KV namespace.
//
//   npm run questions:clear -- --yes            # wipe production (remote)
//   npm run questions:clear -- --local --yes    # wipe local `wrangler dev`
//
// Destructive — requires the explicit --yes flag so a stray run can't wipe
// production. Deletes in one `kv bulk delete` call (no jq needed).
import { execFileSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const scope = args.includes('--local') ? '--local' : '--remote';
const confirmed = args.includes('--yes');
const BINDING = 'NOVEL_QUESTIONS';

// On Windows, npx resolves to npx.cmd — shell:true lets execFileSync find it.
// With shell:true the args are re-parsed by the shell, so any arg containing
// shell metacharacters (keys hold "|" and ":", temp paths may have spaces)
// must be double-quoted.
function wrangler(args) {
  const quoted = args.map((a) => (/[|:\s]/.test(a) ? `"${a}"` : a));
  return execFileSync('npx', ['wrangler', ...quoted], {
    encoding: 'utf8',
    shell: true,
    stdio: ['ignore', 'pipe', 'inherit'],
  });
}

let keys;
try {
  const listOut = wrangler(['kv', 'key', 'list', '--binding', BINDING, scope]);
  keys = JSON.parse(listOut).map((k) => k.name);
} catch (err) {
  console.error('Failed to list KV keys. Is wrangler logged in and the namespace bound?');
  console.error(err.message);
  process.exit(1);
}

if (keys.length === 0) {
  console.log(`Nothing to clear — ${scope.replace('--', '')} namespace is already empty.`);
  process.exit(0);
}

if (!confirmed) {
  console.log(`Would delete ${keys.length} question(s) from the ${scope.replace('--', '')} namespace.`);
  console.log('This is destructive. Re-run with --yes to actually delete:');
  console.log(`  npm run questions:clear -- ${scope === '--local' ? '--local ' : ''}--yes`);
  process.exit(0);
}

// `kv bulk delete` takes a JSON array of key names from a file. Because the
// namespace has both an id and a preview_id, this command requires an explicit
// --preview flag to pick which one (unlike key list/get): real namespace for
// remote, preview namespace for local.
const previewFlag = scope === '--local' ? '--preview' : '--preview=false';
const tmpFile = join(tmpdir(), `novel-questions-delete-${Date.now()}.json`);
writeFileSync(tmpFile, JSON.stringify(keys));
try {
  wrangler(['kv', 'bulk', 'delete', tmpFile, '--binding', BINDING, scope, previewFlag, '--force']);
  console.log(`Deleted ${keys.length} question(s) from the ${scope.replace('--', '')} namespace.`);
} catch (err) {
  console.error('Bulk delete failed:', err.message);
  process.exit(1);
} finally {
  try { unlinkSync(tmpFile); } catch { /* ignore cleanup error */ }
}
