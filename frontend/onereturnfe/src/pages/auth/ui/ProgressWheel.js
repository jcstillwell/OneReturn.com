import React from "react";
import { motion } from 'framer-motion';

const ProgressWheel = ({scrollValue, maxValue}) => {
    
    const progress = Math.min(scrollValue / maxValue, 1)

    const radius = 50;
    const circumference = 2 * Math.PI * radius

    const strokeAnimation = {
        strokeDashOffset: circumference * (1 - progress),
    };

    return (
        <svg width="120" height="120" viewBox="0 0 120 120">
        <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="blue"
            strokeWidth="10"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={strokeAnimation}
        />
        </svg>
    );
};

export default ProgressWheel;