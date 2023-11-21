import React, {useContext, useState} from "react";
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";

const MerchantLogin = (props) =>
{

    const [merchantID, setMerchantID] = useState('');
    const [merchantAPIKey, setMerchantAPIKey] = useState('');
    const [merchantMasterPassword, setMerchantMasterPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(!!Cookies.get('token'));
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    let navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('https://onereturn.com/userapi/authenticateMerchant', {
                'merchantID':merchantID,
                'merchantAPIKey':merchantAPIKey,
                'merchantMasterPassword':merchantMasterPassword,
            });

            if (response.data.status == 'OK') {
                Cookies.set('merchant-auth-token', response.data.token, {expires: 7});
                navigate("/console");
                setError(false);
                setErrorMsg('');
            }
        } catch (error) {
            setError(true);
            setErrorMsg(error.response.data.message);
        }
    }

    return (
        <div classname='merchant-auth-form-container'>
            <form className='merchant-auth-form' onSubmit={handleSubmit}>
                <p>Welcome.</p>
                {error && (
                    <label className='error-message'>{errorMsg}</label>
                )}
                <label htmlFor=''>Merchant ID</label>
                <input value={merchantID} onChange={(e) => setMerchantID(e.target.value)} type='text' placeholder="Your assigned merchant ID"/>
                <label htmlFor=''>Merchant API Key</label>
                <input value={merchantAPIKey} onChange={(e) => setMerchantAPIKey(e.target.value)} type='text' placeholder="Your current active merchant API Key"/>
                <label htmlFor=''>Merchant Master Password</label>
                <input value={merchantMasterPassword} onChange={(e) => setMerchantMasterPassword(e.target.value)} type='password' placeholder="Your merchant password"/>
            </form>
        </div>
    )

}

export default MerchantLogin();