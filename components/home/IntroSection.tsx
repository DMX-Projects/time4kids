'use client';

import React from 'react';

export default function IntroSection() {
    return (
        <>
            <div className="intro-block">
                <div className="container mx-auto px-4">
                    <div className="intro-content">
                        <h1>Welcome to T.I.M.E. Kids</h1>
                        <h2>
                            A chain of pre-schools launched by T.I.M.E., the national leader in
                            entrance exam training.
                        </h2>
                        <p>
                            T.I.M.E. Kids pre-schools is a chain of pre-schools launched by
                            T.I.M.E., the national leader in entrance exam training. After its
                            hugely successful beginning in Hyderabad, T.I.M.E. Kids with 350+
                            pre-schools is now poised for major expansion across the country.
                        </p>
                        <p>
                            The programme at T.I.M.E. Kids pre-schools aims at making the transition
                            from home to school easy, by providing the warm, safe and caring and
                            learning environment that young children have at home. Our play schools
                            offer wholesome, fun-filled and memorable childhood education to our
                            children.
                        </p>
                        <p>
                            T.I.M.E. Kids pre-schools are backed by our educational expertise of over
                            27 years, well trained care providers and a balanced educational
                            programme. The programme at T.I.M.E. Kids pre-schools is based on the
                            principles of age-appropriate child
                        </p>
                    </div>
                </div>
            </div>
            <div className="wave-gray-bottom" />

            <style jsx>{`
                .wave-gray-bottom {
                    float: left;
                    width: 100%;
                    height: 28px;
                    text-align: center;
                    box-sizing: border-box;
                    position: relative;
                    background: url(/wave-gray2.png) repeat-x left top;
                    animation: wave-slide-bottom 60s linear infinite;
                }

                @keyframes wave-slide-bottom {
                    from {
                        background-position: 0 0;
                    }
                    to {
                        background-position: -4000px 0;
                    }
                }

                .intro-block {
                    text-align: center;
                    background: #f5f1dd;
                    font-weight: 500;
                    padding: 50px 0;
                }

                .intro-content {
                    max-width: 900px;
                    margin: 0 auto;
                }

                .intro-block h1 {
                    font-family: 'Schoolbell', cursive;
                    color: #fe5c61;
                    font-size: 28px;
                    line-height: 30px;
                    font-weight: 600;
                    margin: 0 0 25px 0;
                }

                .intro-block h2 {
                    font-family: 'Dosis', sans-serif;
                    color: #333;
                    font-size: 24px;
                    line-height: 30px;
                    font-weight: 700;
                    margin: 0 0 25px 0;
                }

                .intro-block p {
                    margin: 0 0 15px 0;
                    font-size: 16px;
                    line-height: 24px;
                    color: #333;
                }

                @media (max-width: 768px) {
                    .intro-block {
                        padding: 30px 0;
                    }

                    .intro-block h1 {
                        font-size: 24px;
                        line-height: 28px;
                    }

                    .intro-block h2 {
                        font-size: 18px;
                        line-height: 24px;
                    }

                    .intro-block p {
                        font-size: 14px;
                        line-height: 22px;
                    }
                }
            `}</style>
        </>
    );
}
