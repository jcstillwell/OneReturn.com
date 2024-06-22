import React, { useEffect } from "react";
import Cookies from "js-cookie";

const AppSettings = () => {

    return (
        <div className="settings-container">
            <div className="settings-box">
                <p>Application Settings</p>
            </div>
        </div>
    );
}

const UserSettings = () => {

    let data;
    try {
        data = JSON.parse(Cookies.get('data'));
    } catch (e) {
        console.log("error parsing cookie: ", e);
        data = {};
    }

    return (
        <div className="settings-container">
            <div className="settings-box">
                <h1>Profile</h1>
                <h2>{data.firstName} {data.lastName}</h2>
                <p>User Settings</p>
                <ul>
                    <li>First Name: <input type="text" class="editable-text" placeholder={data.firstName}></input></li>
                    <li>Last Name: <input type="text" class="editable-text" placeholder={data.lastName}></input></li>
                    <li>Email: <input type="text" class="editable-text" placeholder={data.email}></input></li>
                </ul>
            </div>
        </div>
    );
}

const ReceiptSettings = () => {
    return (
        <div className="settings-container">
            <div className="settings-box">
                <p>Receipt Settings</p>
                <ul>
                    <li>
                        <label>Allow Receipt Sharing</label>
                        <input type="checkbox" id="receipt-sharing"/>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default AppSettings;
export {UserSettings, ReceiptSettings};