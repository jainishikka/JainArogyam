import { Link } from "react-router-dom";
import "../styles/Header.css";
import { navLinks } from "../consts/navLinks";

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <Link to="/llogin">
          <img src="/ArogyamLogo.jpg" alt="Jain Arogyam" className="logo" />
        </Link>

        <nav>
          <ul className="nav-links">
            {navLinks.map((navLink) => (
              <li key={navLink.title}>
                <Link className="nav-link" to={navLink.link}>
                  {navLink.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

/**
 * <li>
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            <li>
              <Link className="nav-link" to="/about-us">
                About Us
              </Link>
            </li>
            <li>
              <Link className="nav-link" to="/services">
                Services
              </Link>
            </li>
            <li>
              <Link className="nav-link" to="/contact-us">
                Contact Us
              </Link>
            </li>
 * 
 */
