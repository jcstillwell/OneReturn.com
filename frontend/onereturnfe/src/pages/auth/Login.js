import React, { useContext, useState } from 'react';
import axios from 'axios';
import { Route, Redirect, useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import './styles/login.css'
import "./styles/login-register-shared.css"

const Login = (props) =>
{
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(!!Cookies.get('token'))
    const { dispatch } = useContext(AuthContext);
    let navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.post('http://onereturn.com/userapi/authenticate/', {
                'email':email,
                'password':pass,
            });

            if (response.data.status === 'OK') {
                Cookies.set('token', response.data.token, {expires: 7});
                Cookies.set('data', JSON.stringify(response.data.data), {expires: 7});
                dispatch({type: 'LOGIN', payload: response.data});
                navigate("/wallet");
                console.log(JSON.stringify(response.data.data));
                setError(false);
                setErrorMsg('');
            }
        } catch (error) {
            console.log(error);
            setError(true);
            setErrorMsg(error.response.data.message);
        }

    }

    return (
        <motion.div 
            className='auth-form-container'
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.08}}
        >
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
            <button className='link-btn' onClick={() => navigate("/preregister")}>Haven't made an account yet? Register here.</button>
        </motion.div>
    );
}

export default Login;