'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function MediaPage() {
    const [selectedDate, setSelectedDate] = useState('2020-21');
    const [selectedCategory, setSelectedCategory] = useState('Green Color Day - 2021');
    const [activeTab, setActiveTab] = useState('photos');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    // Gallery images
    const images = [
        '/images/center-images/jub-1.jpg',
        '/images/center-images/jub-2.jpg',
        '/images/center-images/jub-3.jpg',
        '/images/center-images/jub-4.jpg',
        '/images/center-images/jub-5.jpg',
        '/images/center-images/jub-6.jpg',
        '/images/center-images/jub-7.jpg',
        '/images/center-images/jub-1.jpg',
        '/images/center-images/jub-2.jpg',
        '/images/center-images/jub-3.jpg',
        '/images/center-images/jub-4.jpg',
        '/images/center-images/jub-5.jpg',
    ];

    // Video links
    const videos = [
        { url: 'https://www.youtube.com/watch?v=O3hJmKrUxGw', title: 'Video 1' },
        { url: 'https://www.youtube.com/watch?v=0ofWzYuv0F4', title: 'Video 2' },
        { url: 'https://www.youtube.com/watch?v=Mg7sp3j4dYU', title: 'Video 3' },
        { url: 'https://www.youtube.com/watch?v=O3hJmKrUxGw', title: 'Video 4' },
        { url: 'https://www.youtube.com/watch?v=0ofWzYuv0F4', title: 'Video 5' },
        { url: 'https://www.youtube.com/watch?v=Mg7sp3j4dYU', title: 'Video 6' },
    ];

    const openLightbox = (imageSrc: string, index: number) => {
        setCurrentImage(imageSrc);
        setCurrentIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const nextImage = () => {
        const newIndex = (currentIndex + 1) % images.length;
        setCurrentIndex(newIndex);
        setCurrentImage(images[newIndex]);
    };

    const prevImage = () => {
        const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
        setCurrentImage(images[newIndex]);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxOpen) {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowRight') nextImage();
                if (e.key === 'ArrowLeft') prevImage();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, currentIndex]);

    return (
        <div className="media-page-wrapper">
            {/* Floating Fun Elements */}
            <div className="floating-decorations">
                <div className="balloon balloon-1">🎈</div>
                <div className="balloon balloon-2">🎈</div>
                <div className="balloon balloon-3">🎈</div>
                <div className="star star-1">⭐</div>
                <div className="star star-2">⭐</div>
                <div className="star star-3">⭐</div>
                <div className="camera-icon">📷</div>
                <div className="video-icon">🎥</div>
            </div>

            {/* BANNER */}
            <div className="center-banner">
                <div className="wave_white_down"></div>
                <div className="container mx-auto px-4">
                    <div className="row">
                        <div className="col-md-6 col-xs-12">&nbsp;</div>
                        <div className="col-md-6 col-xs-12">
                            <h2 className="cb-head animate-bounce-slow">
                                📸 Gallery 🎬
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <section className="content-wrap">
                <div className="li-yel-block">
                    <div className="container mx-auto px-4 pb-3">
                        <div className="row">
                            <div className="c-name">
                                <h3 className="mt-2 text-center shimmer-text">
                                    <Image src="/images/icon-hand.png" alt="icon" width={40} height={40} className="inline-block bounce-icon" />
                                    {' '}
                                    <span className="r-text">T.I.M.E. Kids, </span>
                                    <span className="g-text">Jubilee Hills, </span>
                                    <span className="b-text">Hyderabad</span>
                                </h3>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-4 col-xs-12 mb-2">
                                <select
                                    className="form-control fun-select"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                >
                                    <option>Choose Date 📅</option>
                                    <option>2020-21</option>
                                    <option>2019-20</option>
                                    <option>2018-19</option>
                                    <option>2017-18</option>
                                </select>
                            </div>
                            <div className="col-md-4 col-xs-12 mb-2">
                                <select
                                    className="form-control fun-select"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option>Green Color Day - 2021 🌿</option>
                                    <option>Annual Day 2021 🎉</option>
                                    <option>Another Category 🎨</option>
                                    <option>Another two category 🎪</option>
                                    <option>School Tour 🏫</option>
                                </select>
                            </div>
                            <div className="col-md-4 col-xs-12 mb-2">
                                <button className="btn btn-success btn-lg btn-block pulse-button">
                                    🔍 Search
                                </button>
                            </div>
                        </div>
                        <h3 className="mt-2 text-center pulse-text">
                            <span className="r-text">2019-20, </span>
                            <span className="g-text">Green Color Day</span>
                        </h3>
                    </div>
                </div>
            </section>

            {/* GALLERY TABS */}
            <div className="center-gallery-main">
                <div className="container mx-auto px-4">
                    <nav>
                        <div className="nav nav-tabs nav-fill" role="tablist">
                            <button
                                className={`nav-item nav-link ${activeTab === 'photos' ? 'active' : ''}`}
                                onClick={() => setActiveTab('photos')}
                            >
                                <i className="fa fa-images fa-fw bounce-icon"></i> Photos
                            </button>
                            <button
                                className={`nav-item nav-link ${activeTab === 'videos' ? 'active' : ''}`}
                                onClick={() => setActiveTab('videos')}
                            >
                                <i className="fa fa-play fa-fw rotate-icon"></i> Videos
                            </button>
                        </div>
                    </nav>
                    <div className="tab-content">
                        {activeTab === 'photos' && (
                            <div className="tab-pane-active">
                                <div className="gallery-outer">
                                    <div className="cgo">
                                        {images.map((img, index) => (
                                            <div key={index} className="image-wrapper">
                                                <Image
                                                    className="sq-reverse gallery-image"
                                                    src={img}
                                                    alt={`Gallery image ${index + 1}`}
                                                    width={300}
                                                    height={200}
                                                    onClick={() => openLightbox(img, index)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                <div className="image-overlay">
                                                    <i className="fa fa-search-plus"></i>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'videos' && (
                            <div className="tab-pane-active">
                                <div className="video-box-outer">
                                    {videos.map((video, index) => (
                                        <a
                                            key={index}
                                            className="ho-outer sq-reverse video-card"
                                            href={video.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <div className="video-content">
                                                <i className="fa fa-play-circle fa-3x pulse-icon"></i>
                                                <p>{video.title}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Clear floats to ensure footer displays */}
            <div style={{ clear: 'both' }}></div>

            {/* Lightbox */}
            {lightboxOpen && (
                <div className="lightbox" onClick={closeLightbox}>
                    <div className="filter" style={{ backgroundImage: `url(${currentImage})` }}></div>
                    <Image
                        src={currentImage}
                        alt="Lightbox"
                        width={1200}
                        height={800}
                        onClick={(e) => e.stopPropagation()}
                        className="lightbox-image"
                    />
                    <div className="arrowr" onClick={(e) => { e.stopPropagation(); nextImage(); }}></div>
                    <div className="arrowl" onClick={(e) => { e.stopPropagation(); prevImage(); }}></div>
                    <div className="close" onClick={closeLightbox}></div>
                </div>
            )}

            <style jsx>{`
                /* Floating Decorations */
                .floating-decorations {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 1;
                    overflow: hidden;
                }

                .balloon {
                    position: absolute;
                    font-size: 3rem;
                    animation: float-up 15s infinite ease-in-out;
                }

                .balloon-1 {
                    left: 10%;
                    animation-delay: 0s;
                }

                .balloon-2 {
                    left: 30%;
                    animation-delay: 5s;
                }

                .balloon-3 {
                    right: 15%;
                    animation-delay: 10s;
                }

                .star {
                    position: absolute;
                    font-size: 2rem;
                    animation: twinkle 2s infinite ease-in-out;
                }

                .star-1 {
                    top: 20%;
                    left: 20%;
                    animation-delay: 0s;
                }

                .star-2 {
                    top: 40%;
                    right: 25%;
                    animation-delay: 1s;
                }

                .star-3 {
                    top: 60%;
                    left: 80%;
                    animation-delay: 2s;
                }

                .camera-icon {
                    position: absolute;
                    top: 15%;
                    right: 10%;
                    font-size: 3rem;
                    animation: rotate-icon 10s infinite linear;
                }

                .video-icon {
                    position: absolute;
                    bottom: 20%;
                    left: 15%;
                    font-size: 3rem;
                    animation: bounce 3s infinite ease-in-out;
                }

                @keyframes float-up {
                    0%, 100% {
                        transform: translateY(100vh) translateX(0);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100px) translateX(50px);
                        opacity: 0;
                    }
                }

                @keyframes twinkle {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.3;
                        transform: scale(1.3);
                    }
                }

                @keyframes rotate-icon {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }

                @keyframes bounce {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                }

                @keyframes shimmer {
                    0% {
                        background-position: -1000px 0;
                    }
                    100% {
                        background-position: 1000px 0;
                    }
                }

                /* Bounce Animation */
                .bounce-icon {
                    display: inline-block;
                    animation: bounce 2s infinite ease-in-out;
                }

                .animate-bounce-slow {
                    animation: bounce 3s infinite ease-in-out;
                }

                .rotate-icon {
                    display: inline-block;
                    animation: rotate-icon 4s infinite linear;
                }

                .pulse-icon {
                    animation: pulse 2s infinite ease-in-out;
                }

                .pulse-button {
                    animation: pulse 1.5s infinite ease-in-out;
                    transition: all 0.3s ease;
                }

                .pulse-button:hover {
                    transform: scale(1.1);
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
                }

                .pulse-text {
                    animation: pulse 3s infinite ease-in-out;
                }

                .shimmer-text {
                    background: linear-gradient(90deg, #085390 0%, #cb503d 25%, #6bbc3b 50%, #cb503d 75%, #085390 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: shimmer 3s linear infinite;
                }

                /* Image Gallery Enhancements */
                .image-wrapper {
                    position: relative;
                    overflow: hidden;
                    border-radius: 12px;
                    margin-bottom: 20px;
                    transition: all 0.3s ease;
                }

                .image-wrapper:hover {
                    transform: translateY(-5px) rotate(2deg);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }

                .gallery-image {
                    transition: all 0.3s ease;
                }

                .image-wrapper:hover .gallery-image {
                    transform: scale(1.1);
                }

                .image-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: all 0.3s ease;
                    border-radius: 12px;
                }

                .image-overlay i {
                    color: white;
                    font-size: 3rem;
                    transform: scale(0);
                    transition: all 0.3s ease;
                }

                .image-wrapper:hover .image-overlay {
                    opacity: 1;
                }

                .image-wrapper:hover .image-overlay i {
                    transform: scale(1);
                }

                /* Video Card Enhancements */
                .video-card {
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .video-card::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                    transform: rotate(45deg);
                    transition: all 0.5s ease;
                }

                .video-card:hover::before {
                    left: 100%;
                }

                .video-card:hover {
                    transform: scale(1.05) rotate(-2deg);
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
                }

                .video-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                }

                .video-content p {
                    margin: 0;
                    font-size: 1.2rem;
                    font-weight: 600;
                }

                /* Select Enhancements */
                .fun-select {
                    transition: all 0.3s ease;
                    border: 2px solid #ddd;
                }

                .fun-select:hover {
                    border-color: #cb503d;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }

                .fun-select:focus {
                    border-color: #6bbc3b;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(107, 188, 59, 0.2);
                }

                /* Lightbox Enhancements */
                .lightbox-image {
                    animation: zoomIn 0.3s ease;
                }

                @keyframes zoomIn {
                    from {
                        transform: translate(-50%, -50%) scale(0.8);
                        opacity: 0;
                    }
                    to {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 1;
                    }
                }

                /* Bootstrap grid classes */
                .row {
                    display: flex;
                    flex-wrap: wrap;
                    margin: 0 -15px;
                }

                .col-md-4, .col-md-6, .col-xs-12 {
                    padding: 0 15px;
                }

                .col-md-4 {
                    flex: 0 0 33.333%;
                    max-width: 33.333%;
                }

                .col-md-6 {
                    flex: 0 0 50%;
                    max-width: 50%;
                }

                .col-xs-12 {
                    flex: 0 0 100%;
                    max-width: 100%;
                }

                .mb-2 {
                    margin-bottom: 0.5rem;
                }

                .mt-2 {
                    margin-top: 0.5rem;
                }

                .pb-3 {
                    padding-bottom: 1rem;
                }

                /* Center Banner */
                .center-banner {
                    position: relative;
                    display: block;
                    width: 100%;
                    float: left;
                    min-height: 300px;
                    background: url(/images/center-banner.jpg) center top no-repeat #7db1b7;
                }

                .wave_white_down {
                    float: left;
                    width: 100%;
                    height: 28px;
                    background: url(/images/wave-white-down.png) repeat-x left top;
                    text-align: center;
                    box-sizing: border-box;
                    animation: slide 60s linear infinite;
                    position: absolute;
                    top: 0;
                    z-index: 9;
                }

                @keyframes slide {
                    from { background-position: 0 0; }
                    to { background-position: -4000px 0; }
                }

                .cb-head {
                    color: #fff;
                    font-weight: 800;
                    font-size: 46px;
                    padding-top: 126px;
                    display: block;
                    text-align: center;
                    text-shadow: 0px 0px 4px rgba(0,0,0,0.53);
                    font-family: 'Dosis', sans-serif;
                }

                /* Yellow block section */
                .li-yel-block {
                    background: #f5f1de;
                    padding: 65px 0 0 0;
                    width: 100%;
                    display: block;
                    float: left;
                }

                .li-yel-block .form-control {
                    height: 50px;
                }

                .form-control {
                    display: block;
                    width: 100%;
                    height: 50px;
                    padding: 0.375rem 0.75rem;
                    font-size: 1rem;
                    line-height: 1.5;
                    color: #495057;
                    background-color: #fff;
                    border: 1px solid #ced4da;
                    border-radius: 0.25rem;
                }

                .btn {
                    display: inline-block;
                    font-weight: 400;
                    text-align: center;
                    white-space: nowrap;
                    vertical-align: middle;
                    user-select: none;
                    border: 1px solid transparent;
                    padding: 0.375rem 0.75rem;
                    font-size: 1rem;
                    line-height: 1.5;
                    border-radius: 0.25rem;
                    cursor: pointer;
                }

                .btn-success {
                    color: #fff;
                    background-color: #28a745;
                    border-color: #28a745;
                }

                .btn-lg {
                    padding: 0.5rem 1rem;
                    font-size: 1.25rem;
                    line-height: 1.5;
                    border-radius: 0.3rem;
                }

                .btn-block {
                    display: block;
                    width: 100%;
                }

                .c-name {
                    display: block;
                    width: 100%;
                }

                .r-text {
                    color: #cb503d;
                }

                .g-text {
                    color: #6bbc3b;
                }

                .b-text {
                    color: #2e439d;
                }

                /* Gallery Main */
                .center-gallery-main {
                    width: 100%;
                    display: block;
                    float: left;
                    padding: 40px 0px 5px 0px;
                }

                .center-gallery-main nav > .nav.nav-tabs {
                    border: none;
                    color: #fff;
                    background: #272e38;
                    border-radius: 0;
                    display: flex;
                }

                .center-gallery-main nav > div button.nav-item.nav-link,
                .center-gallery-main nav > div button.nav-item.nav-link.active {
                    padding: 10px 15px !important;
                    color: #fff !important;
                    background: #adaa9d;
                    border-radius: 0;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    flex: 1;
                    transition: all 0.3s ease;
                }

                .center-gallery-main nav > div button.nav-item.nav-link:hover {
                    background: #8b8978;
                    transform: translateY(-2px);
                }

                .center-gallery-main nav > div button.nav-item.nav-link.active {
                    background: #cb503d;
                }

                .center-gallery-main .tab-content {
                    background: #fdfdfd;
                    line-height: 25px;
                    border: 1px solid #ddd;
                    border-top: 5px solid #cb503d;
                    border-bottom: 5px solid #cb503d;
                    padding: 30px 0px;
                    display: block;
                    float: left;
                    width: 100%;
                    margin-bottom: 5px;
                }

                .gallery-outer {
                    display: block;
                    width: 100%;
                    float: left;
                }

                .cgo {
                    column-width: 300px;
                    column-gap: 20px;
                    padding: 20px;
                }

                .cgo :global(img) {
                    width: 100%;
                    cursor: pointer;
                }

                .video-box-outer {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                    padding: 20px;
                }

                .ho-outer {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 200px;
                    background: linear-gradient(135deg, #cb503d 0%, #a4402e 100%);
                    color: #fff;
                    font-size: 18px;
                    font-weight: 600;
                    border-radius: 12px;
                    text-decoration: none;
                    transition: all 0.3s ease;
                }

                /* Lightbox */
                .lightbox {
                    position: fixed;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(127, 140, 141, 0.95);
                    z-index: 9999;
                }

                .filter {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    filter: blur(7px);
                    opacity: 0.5;
                    background-position: center;
                    background-size: cover;
                }

                .lightbox :global(img) {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    max-height: 95vh;
                    max-width: calc(95vw - 100px);
                    transition: 0.8s cubic-bezier(0.7, 0, 0.4, 1);
                    z-index: 10000;
                }

                .arrowr, .arrowl {
                    height: 200px;
                    width: 50px;
                    background: rgba(0, 0, 0, 0.4);
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    z-index: 10001;
                    transition: all 0.3s ease;
                }

                .arrowr:hover, .arrowl:hover {
                    background: rgba(0, 0, 0, 0.7);
                }

                .arrowr {
                    right: 0;
                }

                .arrowl {
                    left: 0;
                }

                .arrowr:after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    width: 15px;
                    height: 15px;
                    border-right: 2px solid white;
                    border-bottom: 2px solid white;
                }

                .arrowl:after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    width: 15px;
                    height: 15px;
                    border-left: 2px solid white;
                    border-top: 2px solid white;
                }

                .close {
                    position: absolute;
                    right: 0;
                    width: 50px;
                    height: 50px;
                    background: rgba(0, 0, 0, 0.4);
                    margin: 20px;
                    cursor: pointer;
                    z-index: 10001;
                    transition: all 0.3s ease;
                }

                .close:hover {
                    background: rgba(255, 0, 0, 0.7);
                    transform: rotate(90deg);
                }

                .close:after,
                .close:before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 2px;
                    height: 100%;
                    background: #fff;
                    opacity: 0.9;
                }

                .close:after {
                    transform: translate(-50%, -50%) rotate(-45deg);
                }

                .close:before {
                    transform: translate(-50%, -50%) rotate(45deg);
                }

                @media (max-width: 768px) {
                    .col-md-4, .col-md-6 {
                        flex: 0 0 100%;
                        max-width: 100%;
                    }

                    .cb-head {
                        font-size: 32px;
                        padding-top: 80px;
                    }

                    .balloon, .star, .camera-icon, .video-icon {
                        font-size: 2rem;
                    }

                    .center-gallery-main {
                        padding: 40px 0px 20px 0px;
                    }
                }
            `}</style>
        </div>
    );
}
