import "bootstrap/dist/css/bootstrap.min.css";
import "../css/App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faMobileScreen } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

function App() {
  return (
    <div className="App">
      <div>
        <header className="App-header">
          <h1>Sherwin Tang</h1>
          <h6>Software Engineer | Project Management</h6>
          <div>
            <FontAwesomeIcon
              icon={faLinkedin}
              style={{ margin: "0 1rem", cursor: "pointer" }}
              onClick={() =>
                window.open(
                  "https://www.linkedin.com/in/sherwin-tang-software-engineer",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            />

            <FontAwesomeIcon
              icon={faMobileScreen}
              data-tooltip-id="phone-tooltip"
              style={{ margin: "0 1rem" }}
            />
            <Tooltip id="phone-tooltip" place="bottom" content="94777959" />
          </div>
        </header>
      </div>
    </div>
  );
}

export default App;
