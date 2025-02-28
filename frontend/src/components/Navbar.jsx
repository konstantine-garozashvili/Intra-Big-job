import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo.png';

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="navbar">
            <Link to="/" className="logo-container">
                <img src={logo} alt="Logo" className="logo" />
                <span className="company-name">La Plateforme</span>
            </Link>
            <div className="burger-menu" onClick={toggleMenu}>☰</div>
            <div className={`menu ${isMenuOpen ? 'open' : ''}`}>
                <Link to="/login" className="menu-item">Login</Link>
                <Link to="/register" className="menu-item">Register</Link>
            </div>
        </nav>
    );
}

export default Navbar;
