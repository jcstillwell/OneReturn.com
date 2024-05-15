import React from "react";
import "./styles/landing.css"

const Landing = () => {
    return (
        <div className="landing-container">
            <div class="one-third">
                <section id='main'>
                    <h1>Welcome to OneReturn</h1>
                    <p>Transform your digital receipts management with our robust, scalable REST API. OneReturn simplifies and automates e-receipt generation for online retailers, enhancing customer satisfaction and operational efficiency.</p>
                </section>
            </div>
            <div class="one-third">
                <section id='business__container'>
                    <h2>Solutions for Online Retailers</h2>
                    <p>From small webshops to large e-commerce platforms, OneReturn offers the tailored solution to help you manage electronic receipts, reduce paper waste, and unify communication with your customers, post transaction. Features:</p>
                    <ul>
                        <li>Automatic e-receipt generation</li>
                        <li>Real-time data access and updates</li>
                        <li>Easy to find, easy to edit receipts</li>
                        <li>Secure data handling</li>
                        <li>Integration with existing POS and e-commerce systems</li>
                    </ul>
                </section>
            </div>
            <div class="one-third">
                <section class="plans__container">
                    <div class="plans">
                        <div class="plansHero">
                        <h1 class="plansHero__title">One pay for what you use.</h1>
                        <p class="plansHero__subtitle">No suprise fees.</p>
                        </div>
                        <div class="planItem__container">
                        <div class="planItem planItem--free">

                            <div class="card">
                            <div class="card__header">
                                <div class="card__icon symbol symbol--rounded"></div>
                                <h2>Free</h2>
                            </div>
                            <div class="card__desc">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do</div>
                            </div>

                            <div class="price">$0<span>/ month</span></div>

                            <ul class="featureList">
                            <li>2 links</li>
                            <li>Own analytics platform</li>
                            <li class="disabled">Chat support</li>
                            <li class="disabled">Mobile application</li>
                            <li class="disabled">Unlimited users</li>
                            </ul>

                            <button class="button">Get Started</button>
                        </div>

                        <div class="planItem planItem--pro">
                            <div class="card">
                            <div class="card__header">
                                <div class="card__icon symbol"></div>
                                <h2>Pro</h2>
                                <div class="card__label label">Best Value</div>
                            </div>
                            <div class="card__desc">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris</div>
                            </div>

                            <div class="price">$18<span>/ month</span></div>

                            <ul class="featureList">
                            <li>2 links</li>
                            <li>Own analytics platform</li>
                            <li>Chat support</li>
                            <li class="disabled">Mobile application</li>
                            <li class="disabled">Unlimited users</li>
                            </ul>

                            <button class="button button--pink">Get Started</button>
                        </div>

                        <div class="planItem planItem--entp">
                            <div class="card">
                            <div class="card__header">
                                <div class="card__icon"></div>
                                <h2>Enterprise</h2>
                            </div>
                            <div class="card__desc">Nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor</div>
                            </div>

                            <div class="price">Let's Talk</div>

                            <ul class="featureList">
                            <li>2 links</li>
                            <li>Own analytics platform</li>
                            <li>Chat support</li>
                            <li>Mobile application</li>
                            <li>Unlimited users</li>
                            <li>Customize Panel</li>
                            </ul>

                            <button class="button button--white">Get Started</button>
                        </div>

                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Landing;