import React, {useState} from "react";

export function ConfirmationPage({ confirmationID, confirmationMsg }) {

    return (
        <div>
            <h1>{confirmationMsg}</h1>
        </div>
    );
}