'use client';

import React from 'react';
import Image from 'next/image';
import Slider from 'react-slick';

export default function BenefitsUpdates() {
    const updatesSettings = {
        dots: true,
        infinite: true,
        fade: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        arrows: false,
        vertical: true,
        verticalSwiping: true,
    };

    const benefits = [
        { number: 1, text: 'Low Investment High Returns', class: 'benefit1' },
        { number: 2, text: 'Strong Brand Name of T.I.M.E.', class: 'benefit2' },
        { number: 3, text: 'Complete Curriculum Support', class: 'benefit3' },
        { number: 4, text: 'Regular Staff Training', class: 'benefit4' },
        { number: 5, text: 'Operational Support', class: 'benefit5' },
    ];

    const [updates, setUpdates] = React.useState([
        {
            date: '28-12-2015',
            text: "T.I.M.E. Kids pre-schools is a chain of pre-schools launched by T.I.M.E., the national leader in entrance exam training. After its hugely successful beginning in Hyderabad, T.I.M.E. Kids with 350+ pre-schools is now poised for major expansion across the country.",
        },
        {
            date: '01-02-2000',
            text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        },
        {
            date: '15-11-2020',
            text: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        },
    ]);

    React.useEffect(() => {
        // Use environment variable or default to localhost
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
        fetch(`${apiUrl}/updates/`)
            .then((res) => res.json())
            .then((data) => {
                const items = Array.isArray(data) ? data : data.results || [];
                if (items.length > 0) {
                    setUpdates(items);
                }
            })
            .catch((err) => console.error('Failed to fetch updates:', err));
    }, []);

    return (
        <div className="benefits-updates">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Benefits Column */}
                    <div className="lg:col-span-7">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 lg:col-span-7">
                                <h3>
                                    Benefits of Becoming <br />a T.I.M.E. Kids Franchise
                                </h3>
                                <ul className="benefits-list">
                                    {benefits.map((benefit) => (
                                        <li key={benefit.number} className={benefit.class}>
                                            <strong>{benefit.number}</strong>
                                            <span>{benefit.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="col-span-12 lg:col-span-5 hidden lg:block">
                                <Image
                                    src="/benefit-pic.jpg"
                                    alt="Benefits"
                                    width={300}
                                    height={400}
                                    className="w-full h-auto"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Updates Column */}
                    <div className="lg:col-span-5">
                        <h3>T.I.M.E. Kids Updates</h3>
                        <div className="time-updates">
                            <div className="updates-inner">
                                <Slider {...updatesSettings}>
                                    {updates.map((update, index) => (
                                        <div key={index}>
                                            <h5>{update.date}</h5>
                                            <p>{update.text}</p>
                                        </div>
                                    ))}
                                </Slider>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .benefits-updates {
                    background: #fff url(/pat2.png) no-repeat 85% bottom;
                    padding: 50px 0;
                }

                .benefits-updates h3 {
                    font-family: 'Schoolbell', cursive;
                    color: #085390;
                    font-size: 28px;
                    line-height: 40px;
                    font-weight: 600;
                    margin: 0 0 25px 0;
                }

                .benefits-list {
                    padding: 0;
                    margin: 0 0 35px 0;
                    list-style: none;
                }

                .benefits-list li {
                    width: 100%;
                    padding: 0 0 3px 0;
                    line-height: 50px;
                    color: #333;
                    font-size: 22px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                }

                .benefits-list strong {
                    font-weight: normal;
                    width: 50px;
                    height: 50px;
                    color: #fff;
                    font-size: 28px;
                    line-height: 50px;
                    font-family: 'Schoolbell', cursive;
                    text-align: center;
                    margin-right: 10px;
                    border-radius: 35% 65% 60% 40% / 50% 32% 68% 50%;
                    flex-shrink: 0;
                }

                .benefits-list .benefit1 strong {
                    background-image: linear-gradient(
                        to right bottom,
                        #20bf55,
                        #33c24f,
                        #43c648,
                        #50c940,
                        #5dcc38,
                        #68ce32,
                        #73d12b,
                        #7ed324,
                        #8ad61f,
                        #95d819,
                        #a1db12,
                        #acdd09
                    );
                }

                .benefits-list .benefit2 strong {
                    background-image: linear-gradient(
                        to right bottom,
                        #7831fe,
                        #6a5aff,
                        #6576ff,
                        #6b8eff,
                        #7da3ff,
                        #83acff,
                        #8bb5fe,
                        #94bdfd,
                        #8ebdfd,
                        #88bdfd,
                        #82bdfd,
                        #7bbdfd
                    );
                    border-radius: 38% 62% 60% 40% / 50% 55% 45% 50%;
                }

                .benefits-list .benefit3 strong {
                    background-image: linear-gradient(
                        to left top,
                        #bb07fe,
                        #cc2efc,
                        #da45fa,
                        #e75af9,
                        #f26df9,
                        #f778f9,
                        #fb83fa,
                        #ff8efa,
                        #ff94fa,
                        #ff9bfa,
                        #ffa1fa,
                        #ffa7fa
                    );
                    border-radius: 61% 39% 33% 67% / 50% 49% 51% 50%;
                }

                .benefits-list .benefit4 strong {
                    background-image: linear-gradient(
                        to right bottom,
                        #fe9d0e,
                        #fea113,
                        #fea518,
                        #fea91d,
                        #fead21,
                        #feb227,
                        #feb72c,
                        #febc32,
                        #fec33b,
                        #fecb43,
                        #fed24c,
                        #fed955
                    );
                    border-radius: 35% 65% 60% 40% / 50% 32% 68% 50%;
                }

                .benefits-list .benefit5 strong {
                    background-image: linear-gradient(
                        to left bottom,
                        #41e3b9,
                        #3fe1ba,
                        #3cdeba,
                        #3adcbb,
                        #39d9bb,
                        #26d3c0,
                        #13cdc3,
                        #00c6c6,
                        #00b9ca,
                        #00accc,
                        #009eca,
                        #0a90c5
                    );
                    border-radius: 61% 39% 33% 67% / 50% 49% 51% 50%;
                }

                /* Updates Slider */
                .time-updates {
                    border-radius: 20px;
                    border: 10px solid #f7cc7e;
                    color: #fff;
                    text-align: center;
                    font-weight: 300;
                    line-height: 24px;
                    font-size: 16px;
                }

                .updates-inner {
                    padding: 30px;
                    box-shadow: inset 8px -10px 70px 54px rgba(1, 53, 61, 1);
                    border-radius: 10px;
                    background-color: #005968;
                    border-left: 1px solid #fff;
                    border-bottom: 1px solid #fff;
                }

                .updates-inner h5 {
                    font-weight: 600;
                    color: #fed509;
                    font-size: 18px;
                    margin: 0 0 15px 0;
                }

                .updates-inner p {
                    margin: 0;
                }

                .updates-inner .slick-dots {
                    position: relative;
                    bottom: 0;
                    margin: 15px 0 0 0;
                }

                .updates-inner .slick-dotted.slick-slider {
                    margin: 0;
                }

                .updates-inner .slick-dots li {
                    background-color: #668138;
                    margin: 0 3px;
                    width: 10px;
                    height: 10px;
                }

                .updates-inner .slick-dots .slick-active {
                    background-color: #fed509;
                }

                @media (max-width: 768px) {
                    .benefits-updates {
                        background: none;
                    }

                    .benefits-list li {
                        font-size: 16px;
                    }
                }
            `}</style>
        </div>
    );
}
