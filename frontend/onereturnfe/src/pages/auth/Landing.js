import React, { useEffect, useState } from "react";
import "./styles/landing.css"
import { motion, scroll } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

const Landing = () => {

    const [hasScrolled, setHasScrolled] = useState(false);
    const [scrollPos, setScrollPos] = useState(0);
    const [lastScrollPos, setLastScrollPos] = useState(0);
    let navigate = useNavigate();


    return (
        <div className="main-container">
            <div className="main-landing-section">
                <motion.div className="main-splash-text"
                    initial={{scale: .5}}
                    animate={{scale: 1}}
                >
                    <h1>One place for all of your digital receipts, absolutely zero email sorting involved.</h1>
                </motion.div>
                <button className="main-trial-button" onClick={() => navigate('/preregister')}><h3>Try OneReturn for personal use.</h3></button>
            </div>

            <div className="for-business" id='for-business'>
                    <div id='for-business-sect1'>
                        <h1>Use OneReturn for your business</h1>
                        <h3>
                            The average person has 1.75 email accounts, the average office worker receives 121 emails each day and, as of 2022, over 162 billion spam emails were sent everyday;
                            odds are: your customer's digital receipts are getting lost.
                        </h3>
                    </div>
                    <div id='for-business-sect2'>
                        <h3>
                            OneReturn provides the all-in-one solution for getting your customers their receipts in an easy find, easy to manage way, on both your and the customers end.
                            Not only are OneReturn receipts searchable by any and all fields, they are formatted in an easy to read way and dynamic so customers can see live updates, such as a return, refund
                            or shipment status.
                        </h3>
                        <button className="main-trial-button"><a href='https://console.onereturn.com/merchantregistration'>Try OneReturn for business.</a></button>
                    </div>
            </div>

            <div className="pricing">
                <h3>PRICING</h3>
                <h2>Undetermined</h2>


            </div>

        </div>
    );

}

export default Landing;