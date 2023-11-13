import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.js";
import Cookies from 'js-cookie';
import { Button } from "./Button.js";
import Dropdown from "../app/Dropdown.js";
import './styles/nav.css';

const Navbar = () => {

    //auth
    const { user, dispatch } = useContext(AuthContext);
    const isAuthenticated = !!user;

    //util
    const [click, setClick] = useState(false);
    const [dropdown, setDropdown] = useState(false);
    let navigate = useNavigate();

    const handleClick = () => setClick(!click);
    const toggleDropdown = () => setDropdown(!dropdown);

    return (
        <nav className="nav">
            <div className="navbar-logo">
                <h3>OneReturn</h3>
            </div>
            <ul>
                {!isAuthenticated && (
                    <>
                        <ul className='nav-menu'>
                            <li className="nav-item">
                                <Link to="/home" className="nav-links" smooth={true} duration={500}>Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="section-2" className="nav-links">For Businesses</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="section-3" className="nav-links">Pricing</Link>
                            </li>
                            <li>
                                <Link to="api.onereturn.com" className="nav-links">API</Link>
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
                                <Button />
                            </li>
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