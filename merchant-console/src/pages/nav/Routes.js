import React from 'react';
import { Route, Redirect, Routes, useNavigate, useLocation } from 'react-router-dom';
import MerchantLogin from '../auth/Login.js';

function Router() {

    const location = useLocation();

    return (

        <Routes location={location} key={location.pathname}>
            <Route path="/signin" element={<MerchantLogin/>}/>
        </Routes>

    )
}

export default Router;