import React, {useState} from "react";

const ConfirmationPage = ({ confirmationID, confirmationMsg }) => {

    return (
        <div className="merchant-reg-container">
            <h1>{confirmationMsg}</h1>
            <h2>{confirmationID}</h2>
        </div>
    );
}

export default ConfirmationPage;