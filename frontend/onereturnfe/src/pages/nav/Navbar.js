import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.js";
import Cookies from 'js-cookie';
import Dropdown from "../app/Dropdown.js";
import './styles/nav.css';
import { NavbarVisContext } from "../../context/NavbarVisContext.js";

const Navbar = () => {

    //auth
    const { user, dispatch } = useContext(AuthContext);
    const isAuthenticated = !!user;
    const { isVisible, setIsVisible } = useContext(NavbarVisContext)

    //util
    const [click, setClick] = useState(false);
    const [dropdown, setDropdown] = useState(false);
    let navigate = useNavigate();

    const handleClick = () => setClick(!click);
    const toggleDropdown = () => setDropdown(!dropdown);

    return (
        <nav className={isVisible ? "nav":"nav-invis"}>
            <div className="navbar-logo">
                <h3>OneReturn</h3>
            </div>
            <ul>
                {!isAuthenticated && (
                    <>
                        <ul className='nav-menu'>
                            <li className="nav-item">
                                <Link to="home" className="nav-links" smooth={true} duration={500}>Home</Link>
                            </li>
                            <li>
                                <a href="https://api.onereturn.com" className="nav-links">API</a>
                            </li>
                            <li className="nav-item">
                                <Link to="/login" className="nav-links">Login</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/preregister" className="nav-links">Register</Link>
                            </li>
                        </ul>
                    </>
                )}
                {isAuthenticated && (
                    <>
                        <ul className='nav-menu-right'>
                            <li className="nav-item">
                                <span className="nav-links" onClick={toggleDropdown}><i className='fa-solid fa-bars'/></span>
                            </li>
                            {dropdown && (
                                <Dropdown/>
                            )}
                        </ul>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;