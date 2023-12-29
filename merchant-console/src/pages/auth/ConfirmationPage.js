import React, {useState} from "react";

const ConfirmationPage = ({ confirmationMsg }) => {

    return (
        <div className="merchant-reg-container">
            <h2>{confirmationMsg}</h2>
        </div>
    );
}

export default ConfirmationPage;