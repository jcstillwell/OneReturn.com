import React from 'react';
import { Route, Redirect, Routes, useNavigate, useLocation } from 'react-router-dom';
import MerchantLogin from '../auth/Login.js';
import { MerchantRegister, MerchantRegisterPreVerify } from '../auth/Register.js';
import MerchantConsole from '../app/Console.js';

function Router() {

    const location = useLocation();

    return (

        <Routes location={location} key={location.pathname}>
            <Route path="/signin" element={<MerchantLogin/>}/>
            <Route path="/merchantregistration" element={<MerchantRegister/>}/>
            <Route path="/" element={<MerchantConsole/>}/>
            <Route path='/merchantpreregister' element={<MerchantRegisterPreVerify/>}/>
        </Routes>

    )
}

export default Router;