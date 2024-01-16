import React from 'react';
import { Route, Redirect, Routes, useNavigate, useLocation } from 'react-router-dom';
import MerchantLogin from '../auth/Login.js';
import { MerchantRegister, MerchantRegisterPreVerify } from '../auth/Register.js';
import MerchantConsole from '../app/Console.js';
import Verify from '../auth/VerifyMerchant.js';
import { AnimatePresence } from 'framer-motion'

function Router() {

    const location = useLocation();

    return (

        <AnimatePresence mode='wait'>
            <Routes location={location} key={location.pathname}>
                <Route path="/signin" element={<MerchantLogin/>}/>
                <Route path="/merchantregistration" element={<MerchantRegister/>}/>
                <Route path="/" element={<MerchantConsole/>}/>
                <Route path='/merchantpreregister' element={<MerchantRegisterPreVerify/>}/>
                <Route path="/verifymerchant" element={<Verify/>}/>
            </Routes>
        </AnimatePresence>
    )
}

export default Router;