import React, { useState } from "react";
import "./styles/popup.css"

const PopupWindow = (props) => {

    const {label, buttonLeft, buttonRight, 
           confirm, toggleVisibility, textfeild = false, 
           textfeildCaption='', textfeildLabel='', textfeildType=''} = props;

    const [output, setOutput] = useState('');

    const handleChange = (e) => {
        setOutput(e.target.value);
        console.log(output);
    }

    return (
        <div className='popup-container'>
            <span className="label">{label}</span>

            {textfeild && (
            <div type='textbox'> 
                <span>{textfeildCaption}</span>
                <input type={textfeildType} label={textfeildLabel} onChange={handleChange}/>
            </div>
            )}

            <button onClick={() => {confirm(output); toggleVisibility();}}>{buttonRight}</button>
            <button onClick={() => toggleVisibility()}>{buttonLeft}</button>
        </div>
    )

}

export default PopupWindow;