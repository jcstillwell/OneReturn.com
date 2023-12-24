import React, { useEffect, useState } from "react";
import "./styles/landing.css"
import { motion, scroll } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import ProgressWheel from "./ui/ProgressWheel";

const Landing = () => {

    const [hasScrolled, setHasScrolled] = useState(false);
    const [scrollPos, setScrollPos] = useState(0);
    let navigate = useNavigate();


    useEffect(() => {
        const handleScroll = (event) => {
            setScrollPos(prevScrollPos => prevScrollPos + event.deltaY / 100);
            setHasScrolled(true);
        }

        window.addEventListener('wheel', handleScroll);

        return () => {
            window.removeEventListener('wheel', handleScroll);
        }
    }, []);

    return (
        <div className="main-container">
            <ProgressWheel scrollValue={scrollPos} maxValue={100} />
            <motion.div className="main-splash-text"
                initial={{ opacity: 0}}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <h1>One place for all of your digital receipts, absolutely zero email sorting involved.</h1>
                <h1>{scrollPos}</h1>
            </motion.div>

            <button className="main-trial-button" onClick={() => navigate('/preregister')}><h3>Try OneReturn for personal use.</h3></button>


            <div className="for-business">
                <h3>
                    The average person has 1.75 email accounts, the average office worker receives 121 emails each day and, as of 2022, over 162 billion spam emails were sent everyday;
                    odds are: your customer's digital receipts are getting lost.
                </h3> 
                <h3>
                    OneReturn provides the all-in-one solution for getting your customers their receipts in an easy find, easy to manage way, on both your and the customers end.
                    Not only are OneReturn receipts searchable by any and all fields, they are formatted in an easy to read way and dynamic so customers can see live updates, such as a return, refund
                    or shipment status.
                </h3>
            </div>

        </div>
    );

}

export default Landing;