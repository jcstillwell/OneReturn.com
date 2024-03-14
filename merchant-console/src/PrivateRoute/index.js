import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { BrowserRouter } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    const token = Cookies.get('token');
    return token ? children : <Navigate to="/signin" />;
}

export default PrivateRoute;