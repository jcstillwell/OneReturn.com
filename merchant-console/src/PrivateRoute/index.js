import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { BrowserRouter } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    //SECURITY NOTE: this does not look safe, likely need to add another layer of security here instead of just checking that a token does in fact exist.
    const token = Cookies.get('merchant-auth-token');
    return token ? children : <Navigate to="/signin" />;
}

export default PrivateRoute;