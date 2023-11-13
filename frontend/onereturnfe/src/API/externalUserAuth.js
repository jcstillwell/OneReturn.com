import React from "react";
import axios from "axios";

//WIP

const ExternalUserAuthentication = () => {

    return (
        <div className="ext-auth-form-container">
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
        </div>
    );
}

export default ExternalUserAuthentication;