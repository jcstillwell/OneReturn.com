import axios from "axios";
import React, { useState, useEffect, useContext } from "react";

const Verify = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const [isVerified, setIsVerified] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await axios.post('https://onereturn.com/userapi/verifymerchant/', {
                    'token':token
                });

                if (response.data.status === 'OK') {
                    setIsVerified(true);
                    setSuccessMsg(response.data.message);
                    console.log("success section, no axios error" + response.data.message);
                    console.log("success msg:" + successMsg);
                    console.log("Error msg:" + errorMsg);
                } else {
                    setError(true);
                    setErrorMsg(response.data.message);
                    console.log("else section, no axios error: " + response.data.message);
                    console.log("Error msg:" + errorMsg);
                    console.log("success msg:" + successMsg);
                }
            } catch (error) {
                console.error(error);
                setError(true);
                setErrorMsg(error.response?.data?.message || "An error occurred");
            }
        };

        verifyToken();
    }, [token]);

    if (error) {
        return (
            <div className="main">
                <h1 className="status">{errorMsg}</h1>
            </div>
        );
    } else if (isVerified) {
        return (
            <div className="main">
                <h1 className="status">{successMsg}</h1>
            </div>
        );
    } else {
        return (
            <div className="main">
                <h1 className="status">Please wait on this page until your email address is verified.</h1>
            </div>
        );
    }
}

export default Verify;
