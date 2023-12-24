import React, {useState} from "react";
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import './css/register.css';


const MerchantRegister = () => {

    let navigate = useNavigate();

    const [formInfo, setFormInfo] = useState({
        businessName:'',
        businessAddress:'',
        businessType:'',
        industry:'',
        primaryContactName:'',
        primaryPhoneNumber:'',
        primaryEmailAddress:'',
        numOfEmployees:'',

    });

    const handleInput = (event) => {
        const {name, value} = event.target;
        setFormInfo(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    return (

        <div className="merchant-reg-container">
            <form className='merchant-reg-form'>
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
                <label htmlFor="">Total Number of Employees</label>
                <input name="numOfEmployees" value={formInfo.numOfEmployees} onChange={handleInput} id="numOfEmployees" type="text" placeholder="5, 10, 15, 20..." />
            </form>
            <button className='link-btn' onClick={() => navigate("/signin")}>Already have an account? Log in here.</button>
        </div>

    );

}

export default MerchantRegister;