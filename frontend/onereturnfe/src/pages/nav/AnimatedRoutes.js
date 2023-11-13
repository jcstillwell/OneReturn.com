import React from 'react'
import { Route, Redirect, Routes, useNavigate, useLocation} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion'

import { SidebarContext } from "../../context/SidebarContext.js";

import AppSettings, {UserSettings, ReceiptSettings} from '../app/Settings.js'
import Login from '../auth/Login.js'
import { Register, RegisterPreVerify } from '../auth/Register.js'
import Wallet, {Shared} from '../app/Wallet.js'
import Invoice from "../app/Invoice.js";
import Landing from "../auth/Landing.js";
import PrivateRoute from "../../PrivateRoute/index.js"



function AnimatedRoutes() {

    const location = useLocation();

    return(

        <AnimatePresence mode='wait'>
            <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/preregister" element={<RegisterPreVerify/>}/>
                <Route path="/home" element={<Landing/>}/>
                <Route path="/wallet" element={<PrivateRoute><Wallet/></PrivateRoute> } />
                <Route path="/shared" element={<PrivateRoute><Shared/></PrivateRoute> } />
                <Route path="/invoices/:invoiceID" element={<PrivateRoute><Invoice/></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><AppSettings/></PrivateRoute> } />
                <Route path="/settings/user" element={<PrivateRoute><UserSettings/></PrivateRoute> } />
                <Route path="/settings/receipts" element={<PrivateRoute><ReceiptSettings/></PrivateRoute> } />
            </Routes>
        </AnimatePresence>
    )
}

export default AnimatedRoutes