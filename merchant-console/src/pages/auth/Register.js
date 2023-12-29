import React, {useState} from "react";
import ConfirmationPage from "./ConfirmationPage";
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import './css/register.css';


const MerchantRegister = () => {

    let navigate = useNavigate();
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [message, setMessage] = useState('');
    const [confirmed, setConfirmed] = useState(false);
    const [confirmationID, setConfirmationID] = useState('');

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
            const response = await axios.post('https://onereturn.com/userapi/merchantRegLead', {
                'businessName':formInfo.businessName,
                'businessAddress':formInfo.businessAddress,
                'businessType':formInfo.businessType,
                'industry':formInfo.industry,
                'primaryContactName':formInfo.primaryContactName,
                'primaryPhoneNumber':formInfo.primaryPhoneNumber,
                'primaryEmailAddress':formInfo.primaryEmailAddress,
                'numRegisters':formInfo.numRegisters,
            });

            if (response.data.status === 'OK') {
                setError(false);
                setErrorMsg('');
                setConfirmed(true);
                setMessage(response.data.message);
                setConfirmationID(response.data.confirmationID);
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
        <div className="merchant-reg-container">
            <ConfirmationPage confirmationID={confirmationID} message={message}/>
        </div>
    } else {
        return (
            <div className="merchant-reg-container">
                <form className='merchant-reg-form' onSubmit={handleSubmit}>
                    <p>Please fill out the required feilds below.</p>
                    <label htmlFor="businessName">Business Name</label>
                    <input name="businessName" value={formInfo.businessName} onChange={handleInput} id="businessName" type="text" placeholder="Example LLC" />
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
                    <label htmlFor="">Primary Email Address</label>
                    <input name="primaryEmailAddress" value={formInfo.primaryEmailAddress} onChange={handleInput} id="primaryEmailAddress" type="text" placeholder="filler@business.com" />
                    <label htmlFor="">Number of physical registers</label>
                    <h6 className="form-note">If your business operates using a web-based platform(Etsy, Shopify, Website, etc...) and does not use physical registers, just enter NA.</h6>
                    <input name="numRegisters" value={formInfo.numRegisters} onChange={handleInput} id="numRegisters" type="text" placeholder="5, 10, 15, 20..." />
                    <button className="submit-button" type="submit">Submit Lead</button>
                </form>
                <button className='link-btn' onClick={() => navigate("/signin")}>Already have an account? Sign in here.</button>
            </div>
        );
    }
}

export default MerchantRegister;