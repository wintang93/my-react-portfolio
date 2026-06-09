import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";

function Navibar() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container style={{margin: '0'}}>
        <Navbar.Brand href="#/">Sherwin Portfolio</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* <Link to="/" style={{ margin: '0 10px' }}>Home</Link> */}
            <Nav.Link href="#/"><FontAwesomeIcon icon={faHome} style={{ fontSize: "24px" }} /></Nav.Link>
            <Nav.Link href="#/experiences">Experiences</Nav.Link>
            <Nav.Link href="#/education">Education</Nav.Link>
            {/* <Link to="/about" style={{ margin: '0 10px' }}>About</Link> */}
            {/* <Nav.Link href="#/contact">Contact Me</Nav.Link> */}
            {/* <Link to="/contact" style={{ margin: '0 10px' }}>Contact</Link> */}
            <NavDropdown title="Projects" id="basic-nav-dropdown">
              <NavDropdown.Item href="#/projects">AI / ML Projects</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#/snake">Snake Game</NavDropdown.Item>
              <NavDropdown.Item href="#/Timer">Timer</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navibar;