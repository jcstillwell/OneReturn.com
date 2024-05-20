import React from "react";
import "./styles/landing.css";

const Landing = () => {
    return (
        <div className="construction-container">
            <header className="header">
                <div className="logo">OneReturn</div>
            </header>
            <main className="content">
                <h1>We're Under Construction</h1>
                <p>Our website is currently under construction. We'll be here soon with our new awesome site.</p>
                <p>Stay tuned!</p>
            </main>
            <footer className="footer">
                <p>&copy; 2024 OneReturn. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default Landing;
