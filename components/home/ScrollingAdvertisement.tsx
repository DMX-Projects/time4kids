import React from 'react';
import './ScrollingAdvertisement.css';

const ScrollingAdvertisement = () => {
    return (
        <div className="scrolling-advertisement border-y border-orange-100 bg-orange-50/30">
            <div className="scrolling-text">
                <span className="marquee-content">
                    <strong>Welcome to T.I.M.E. Kids.</strong> T.I.M.E. Kids pre-schools is a chain of pre-schools launched by T.I.M.E., the national leader in entrance exam training. After its hugely successful beginning in Hyderabad, T.I.M.E. Kids with 250+ pre-schools is now poised for major expansion across the country.
                </span>
                <span className="marquee-content" aria-hidden="true">
                    <strong>Welcome to T.I.M.E. Kids.</strong> T.I.M.E. Kids pre-schools is a chain of pre-schools launched by T.I.M.E., the national leader in entrance exam training. After its hugely successful beginning in Hyderabad, T.I.M.E. Kids with 250+ pre-schools is now poised for major expansion across the country.
                </span>
            </div>
        </div>
    );
};

export default ScrollingAdvertisement;
