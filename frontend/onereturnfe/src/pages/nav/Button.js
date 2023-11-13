import React from "react";
import { Link } from "react-router-dom";
import "./styles/button.css"

export function Button() {
    return (
        <Link to='/wallet'>
            <button className="btn">Dashboard</button>
        </Link>
    );
}