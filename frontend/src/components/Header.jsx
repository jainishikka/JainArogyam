import { Link } from "react-router-dom";
import "../styles/Header.css";

const Header = () => {
    return (
        <header className="header">
            <div className="container">
                <Link to="/">
                <img src="/ArogyamLogo.jpg" alt="Jain Arogyam" className="logo" />
                </Link>
                
                <nav>
                    <ul className="nav-links">
                        <li><Link className="nav-link" to="/">Home</Link></li>
                        <li><Link className="nav-link" to="/about-us">About Us</Link></li>
                        <li><Link className="nav-link" to="/services">Services</Link></li>
                        <li><Link className="nav-link" to="/contact-us">Contact Us</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
