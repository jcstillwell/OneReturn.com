import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext.js";
import Cookies from "js-cookie";
import axios from "axios";
import "./css/dropdown.css"
import { useNavigate, Link } from "react-router-dom";

const BACKEND = process.env.REACT_APP_BACKEND;

const Dropdown = () => {

    const { user, dispatch } = useContext(AuthContext);
    const firstName = Cookies.get('firstName');
    const token = Cookies.get('token');
    let navigate = useNavigate();

    const handleLogout = async (e) => {

        const response = await axios.post(BACKEND+'/logout/', {},{
            headers: {
                'Authorization': "Token " + token
            }
        })
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error('There was an error', error);
        });

        Cookies.remove('merchant-auth-token');
        Cookies.remove('data');
        Cookies.remove('active-uuid');

        dispatch({ type: 'LOGOUT' });
        navigate('/signin');
    }

    return (
        <div className="dropdown-container">
            <ul className="dropdown-menu">
                <li></li>
                <li className="dropdown-item" onClick={() => navigate('/settings')}>
                    <i class="fa-solid fa-gear"></i>
                    <span className="dd-item-text">Settings</span>
                </li>
                <li className="dropdown-item" onClick={handleLogout}>
                    <i class="fa-solid fa-right-from-bracket"></i>
                    <span className="dd-item-text">Logout</span>
                </li>
            </ul>
        </div>
    )

}

export default Dropdown;