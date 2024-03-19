import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import "./styles/register.css";
import "./styles/email-phone-auth.css"
import "./styles/login-register-shared.css"

const BACKEND = process.env.REACT_APP_BACKEND;

const RegisterPreVerify = (props) =>
{

    const [email, setEmail] = useState('');
    const [confirmClicked, setConfirmClicked] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    let navigate = useNavigate();

    const checkVerification = async () => {
        if (confirmClicked) {
            axios.get(BACKEND+'/verify/', {
                params: {
                    'email': email
                }
            })
            .then(response => {
                if (response.data.status === 'OK') {
                    Cookies.set('active-uuid', response.data.uuid, {expires: .05})
                    console.log(email) //remove
                    Cookies.set('email_temp_save', email, {expires: .05}) // Extremely insecure remove after demo.
                    console.log(Cookies.get('email_temp_save'))
                    console.log(response.data);
                    setEmailVerified(true);
                    navigate('/register');
                }
            })
            .catch(error => {
                console.error("Error", error)
            })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setConfirmClicked(true);

        checkVerification();
        try {
            const response = await axios.post(BACKEND+'/sendEmail/', {
                'email':email,
            });
            console.log(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        const intervalID = setInterval(checkVerification, 3000);

        return () => clearInterval(intervalID);
    }, [email, confirmClicked]);

    return (
        <motion.div 
            className='auth-form-container'
            initial={{width: "80%"}}
            animate={{width: "70%"}}
            exit={{width: "60%"}}
            transition={{ duration: .5 }}
        >
            <form className='register-pre-verify' onSubmit={handleSubmit}>
                <div className='pre-verify-titles'>
                    <h4>Welcome to the inbox built exclusively for managing receipts, no email sorting involved.</h4>
                    <p>First, let's confirm your email address.</p>
                </div>
                {confirmClicked && (
                        <div className='pre-verify-confirmation-message'>
                                <h4 className='confirm-message'>{!emailVerified? "Email sent!":"Great! your email address has been verified, redirecting..."}</h4>
                        </div>
    
                )}
                <div className='verification-user-input'>
                    {confirmClicked && (
                        <>
                            <div className='pre-verify-confirmation-icon'>
                                {emailVerified? <div className="confirm-icon"><i class="fa-solid fa-check"></i></div>:<div class='spinner'></div>}
                            </div>
                        </>
                    
                    )}
                    <input value={email} onChange={(e) => {setEmail(e.target.value); setConfirmClicked(false);}} type="email" placeholder="youremail@domain.com" required='true' />
                    <button type="submit" className='submit-button'><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </form>
        </motion.div>
    )
}

const Register = (props) => 
{
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const { dispatch } = useContext(AuthContext);
    let navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.post(BACKEND+'/register/', {
                'uuid':Cookies.get('active-uuid'),
                'first_name':firstName,
                'last_name':lastName,
                'password':pass,
            });

            setEmail(Cookies.get('email_temp_save'));
            console.log(email);
            console.log(response.data);
            console.log(Cookies.get('email_temp_save'))
            try {
                const response = await axios.post(BACKEND+'/authenticate/', {
                    'email': email, // Extremely insecure remove after demo.
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
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <motion.div 
            className='auth-form-container'
            initial={{x: -1000}}
            animate={{ x: 0}}
            exit={{ duration: .5}}
            transition={{type: "spring"}}
        >
            <form className='register-form' onSubmit={handleSubmit}>
                <p>Now you can fill out your personal details here. We will not share this information.</p>
                <p>UUID: {Cookies.get('active-uuid')}</p>
                <label htmlFor="firstName">First Name</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} id="firstName" type="text" placeholder="John" />
                <label htmlFor="lastName">Last Name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} id="lastName" type="text" placeholder="Doe" />
                <label htmlFor="email">Password</label>
                <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder='Password'/>
                <button type="submit">Register</button>
            </form>
            <button className='link-btn' onClick={() => navigate("/login")}>Already have an account? Log in here.</button>
        </motion.div>
    );
}

export { RegisterPreVerify, Register };
