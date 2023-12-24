import React from 'react';
import { Route, Redirect, Routes, useNavigate, useLocation } from 'react-router-dom';
import MerchantLogin from '../auth/Login.js';
import Register from '../auth/Register.js';
import MerchantConsole from '../app/Console.js';

function Router() {

    const location = useLocation();

    return (

        <Routes location={location} key={location.pathname}>
            <Route path="/signin" element={<MerchantLogin/>}/>
            <Route path="/merchantregistration" element={<Register/>}/>
            <Route path="/" element={<MerchantConsole/>}/>
        </Routes>

    )
}

export default Router;