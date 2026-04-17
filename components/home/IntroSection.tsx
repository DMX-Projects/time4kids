'use client';

import React from 'react';
import { useHomePageContent } from '@/components/home/HomePageContentProvider';

export default function IntroSection() {
    const home = useHomePageContent();
    const intro = home.intro;

    return (
        <>
            <div id="about" className="intro-block scroll-mt-40">
                <div className="container mx-auto px-4">
                    <div className="intro-content">
                        <h1>{intro.title}</h1>
                        <h2>{intro.subtitle}</h2>
                        {intro.paragraphs.map((p, i) => (
                            <p key={i}>{p}</p>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .intro-block {
                    text-align: center;
                    background: #f5f1dd url(/images/bg2.gif) repeat-x center bottom;
                    font-weight: 500;
                    padding: 50px 0;
                }

                .intro-content { max-width: 900px; margin: 0 auto; }

                .intro-block h1 {
                    font-family: 'Schoolbell', cursive; color: #fe5c61; font-size: 28px;
                    line-height: 30px; font-weight: 600; margin: 0 0 25px 0;
                }

                .intro-block h2 {
                    font-family: 'Dosis', sans-serif; color: #333; font-size: 24px;
                    line-height: 30px; font-weight: 700; margin: 0 0 25px 0;
                }

                .intro-block p {
                    margin: 0 0 15px 0; font-size: 16px; line-height: 24px; color: #333;
                }

                @media (max-width: 768px) {
                    .intro-block { padding: 25px 0; }
                    .intro-block h1 { font-size: 24px; }
                    .intro-block h2 { font-size: 20px; }
                }
            `}</style>
        </>
    );
}
