// Dump every brand-new question logged to the NOVEL_QUESTIONS KV namespace.
//
//   npm run questions            # production (remote) namespace
//   npm run questions -- --local # local `wrangler dev` namespace
//
// Reads the KV index, fetches each value, and prints it readably — no jq needed.
import { execFileSync } from 'node:child_process';

const scope = process.argv.includes('--local') ? '--local' : '--remote';
const BINDING = 'NOVEL_QUESTIONS';

// On Windows, npx resolves to npx.cmd — shell:true lets execFileSync find it.
// With shell:true the args are re-parsed by the shell, so any arg containing
// shell metacharacters (the keys hold "|" and ":") must be double-quoted.
function wrangler(args) {
  const quoted = args.map((a) => (/[|:\s]/.test(a) ? `"${a}"` : a));
  return execFileSync('npx', ['wrangler', ...quoted], {
    encoding: 'utf8',
    shell: true,
    stdio: ['ignore', 'pipe', 'ignore'],
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
  console.log(`No questions logged yet in the ${scope.replace('--', '')} namespace.`);
  process.exit(0);
}

// Keys are "<ISO timestamp>|<uuid>" — sort ascending so oldest prints first.
keys.sort();

console.log(`${keys.length} logged question(s) [${scope.replace('--', '')}]:\n`);
for (const key of keys) {
  let entry;
  try {
    entry = JSON.parse(wrangler(['kv', 'key', 'get', key, '--binding', BINDING, scope]));
  } catch {
    console.log(`(could not read ${key})\n`);
    continue;
  }
  console.log(`Q: ${entry.question}`);
  console.log(`A: ${entry.answer}`);
  console.log(`   asked: ${entry.askedAt}`);
  console.log('');
}
