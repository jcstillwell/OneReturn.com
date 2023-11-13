import React from "react";
import "./styles/landing.css"
import { motion } from "framer-motion";

const Landing = () => {

    return (
        <div className="container">
            <div id='section-1' className="section">
                <motion.div 
                    className="anim-container-catch"
                    initial={{ x: -1000}}
                    animate={{ x: 0}}
                    exit={{ x: 0}}
                    transition={{duration: 0.5}}
                >
                    <h3 className="text">One place for all of your digital receipts.</h3>
                    <h3 className="text">Absolutely no email sorting involved.</h3>
                </motion.div>
            </div>
            <div id='section-2' className="section">
                <h1>PRICING</h1>
            </div>
            <div id='section-3' className="section">
                <h1>BUSINESS</h1>
            </div>
        </div>



    )
}

export default Landing;