import axios from "axios";
import React, {useState, useEffect} from "react";

const Verify = async () => {

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const [isVerified, setIsVerified] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    try {
        const response = await axios.get('https://onereturn.com/userapi/verify?token=${token}');
        if(response.data.status === 'OK') {
            setIsVerified(true);
            setSuccessMsg(response.data.message);
        } else {
            setError(true);
            setErrorMsg(response.data.message);
        }
    } catch (error) {
        console.log(error); //REMOVE
        setError(true);
        setError(error.response.data.message);
    }

    if (error) {
        return (
            <div className="main">
                <h1 className="status">{errorMsg}</h1>
            </div>
        );
    }
    else if (isVerified) {
        return (
            <div className="main">
                <h1 className="status">{successMsg}</h1>
            </div>
        );
    } 
    else {
        return (
            <div className="main">
                <h1 className="status">Please wait on this page until your email address is verified.</h1>
            </div>
        );
    }
}

export default Verify;