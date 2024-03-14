import React, {useState, useEffect} from "react";
import ConfirmationPage from "./ConfirmationPage.js";
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import './css/register.css';
import './css/preverify.css';
import Cookies from "js-cookie";

const MerchantRegisterPreVerify = (props) =>
{

    const [email, setEmail] = useState('');
    const [confirmClicked, setConfirmClicked] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    let navigate = useNavigate();

    const checkVerification = async () => {
        if (confirmClicked) {
            axios.get('https://onereturn.com/userapi/verifymerchant/', {
                params: {
                    'email': email,
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
            const response = await axios.post('https://onereturn.com/userapi/sendEmail/', {
                'email':email,
                'method':'merchant'
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
            className='merchant-auth-form-container'
            initial={{width: "80%"}}
            animate={{width: "70%"}}
            exit={{width: "60%"}}
            transition={{ duration: .5 }}
        >
            <form className='register-pre-verify' onSubmit={handleSubmit}>
                <div className='pre-verify-titles'>
                    <h4>Simplify Your Receipts: Effortless Management for You and Your Customers!</h4>
                    <p>First, let's confirm the primary contact that will be on the account.</p>
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
                    <input value={email} onChange={(e) => {setEmail(e.target.value); setConfirmClicked(false);}} type="email" placeholder="filler@business.com" required='true' />
                    <button type="submit" className='submit-button'><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </form>
        </motion.div>
    )
}


const MerchantRegister = () => {

    let navigate = useNavigate();
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [message, setMessage] = useState('');
    const [confirmed, setConfirmed] = useState(false);

    const [formInfo, setFormInfo] = useState({
        businessName:'',
        businessAddress:'',
        businessType:'',
        industry:'',
        primaryContactName:'',
        primaryPhoneNumber:'',
        primaryEmailAddress:'',
        numRegisters:'',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.post('https://onereturn.com/userapi/merchantReg/', {
                'uuid':Cookies.get('active-uuid'),
                'businessName':formInfo.businessName,
                'businessAddress':formInfo.businessAddress,
                'businessType':formInfo.businessType,
                'industry':formInfo.industry,
                'masterPassword':formInfo.masterPassword,
                'primaryContactName':formInfo.primaryContactName,
                'primaryPhoneNumber':formInfo.primaryPhoneNumber,
                'numRegisters':formInfo.numRegisters,
            });

            if (response.data.status === 'OK') {
                setError(false);
                setErrorMsg('');
                setConfirmed(true);
                setMessage(response.data.message);
            } else {
                setError(true);
                setErrorMsg(response.data.message);
            }
        } catch (error) {
            setError(true);
            setErrorMsg(error.response.data.message);
        }
    }

    const handleInput = (event) => {
        const {name, value} = event.target;
        setFormInfo(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    if(confirmed) {
        return (
            <div className="merchant-reg-container">
                <ConfirmationPage confirmationMsg={message}/>
            </div>
        );
    } else {
        return (
            <div className="merchant-reg-container">
                <form className='merchant-reg-form' onSubmit={handleSubmit}>
                    <h3>Please fill out the required feilds below.</h3>
                    <label htmlFor="businessName">Business Name</label>
                    <input name="businessName" value={formInfo.businessName} onChange={handleInput} id="businessName" type="text" placeholder="Example LLC" />
                    <label htmlFor='masterPassword'>masterPassword</label>
                    <input name='masterPassword' value={formInfo.masterPassword} onChange={handleInput} id='masterPassword' type='password' placeholder="Account Master Password"/>
                    <label htmlFor="businessAddress">Business Address</label>
                    <input name="businessAddress" value={formInfo.businessAddress} onChange={handleInput} id="businessAddress" type="text" placeholder="1234 Filler Cir, Exampleville, 12345" />
                    <label htmlFor="">Business Type</label>
                    <input name="businessType" value={formInfo.businessType} onChange={handleInput} id="businessType" type="text" placeholder="LLC, Corporation, Sole Proprietorship" />
                    <label htmlFor="">Industry</label>
                    <input name="industry" value={formInfo.industry} onChange={handleInput} id="industry" type="text" placeholder="Marketing, Software, Retail, Manufacturing" />
                    <label htmlFor="">Primary Contact Name</label>
                    <input name="primaryContactName" value={formInfo.primaryContactName} onChange={handleInput} id="primaryContactName" type="text" placeholder="John Doe" />
                    <label htmlFor="">Primary Phone Number</label>
                    <input name="primaryPhoneNumber" value={formInfo.primaryPhoneNumber} onChange={handleInput} id="primaryPhoneNumber" type="text" placeholder="555-555-5555" />
                    <label htmlFor="">Number of physical registers</label>
                    <h6 className="form-note">If your business operates using a web-based platform(Etsy, Shopify, Website, etc...) and does not use physical registers, just enter NA.</h6>
                    <input name="numRegisters" value={formInfo.numRegisters} onChange={handleInput} id="numRegisters" type="text" placeholder="5, 10, 15, 20..." />
                    <button className="submit-button" type="submit">Submit</button>
                </form>
                <button className='link-btn' onClick={() => navigate("/signin")}>Already have an account? Sign in here.</button>
            </div>
        );
    }
}

export { MerchantRegister, MerchantRegisterPreVerify };