import React, {useContext, useState, useEffect} from 'react';
import axios from 'axios';
import { Route, Redirect, useNavigate, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const BACKEND = process.env.REACT_APP_BACKEND;
console.log(process.env.REACT_APP_BACKEND);

const ExternalAuthWindow = () => 
{
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(!!Cookies.get('token'));
    let navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.post((BACKEND+'/authenticate/'), {
                'email':email,
                'password':pass,
                'method':'external',
            });

            if (response.data.status === 'OK') {
                window.opener.postMessage(response.data.uuid, "http://127.0.0.1:5500")
                setError(false);
                setErrorMsg('');
            }
            else {
                console.log("err")
            }
        } catch (error) {
            console.log(error); //Remove this!
            setError(true);
            const errorMessage = error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : 'An error occurred. Please try again later.';
    
            setErrorMsg(errorMessage);
        }

    }

    return (
        <div className='auth-form-container'>
            <form className='login-form' onSubmit={handleSubmit}>
                <p>Welcome back.</p>
                {error && (
                    <label className='error-message'>{errorMsg}</label>
                )}
                <label htmlFor="email">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="youremail@domain.com"/>
                <label htmlFor="password">Password</label>
                <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder='Password'/>
                <button type="submit">Log In</button>
            </form>
        </div>
    );
}

export default ExternalAuthWindow;