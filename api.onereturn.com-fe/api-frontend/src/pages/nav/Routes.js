import React from 'react';
import { Route, Redirect, Routes, useNavigate, useLocation } from 'react-router-dom';
import ExternalAuthWindow from '../ExternalAuth.js';

function Router() {

    const location = useLocation();

    return (

        <Routes location={location} key={location.pathname}>
                <Route path="/externalauth" element={<ExternalAuthWindow/>}/>
        </Routes>
    )
}

export default Router;