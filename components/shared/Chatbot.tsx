'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, MessageCircle } from 'lucide-react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean }>>([
        { text: "Hi there! 👋 I'm here to help you! What would you like to know?", isBot: true }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [showBubble, setShowBubble] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    // Toggle speech bubble automatically to attract attention
    useEffect(() => {
        const interval = setInterval(() => {
            setShowBubble(prev => !prev);
        }, 5000); // Slower toggle for less distraction
        return () => clearInterval(interval);
    }, []);

    const quickQuestions = [
        { text: "🎒 Admission process?", emoji: "🎒" },
        { text: "💰 Fee structure?", emoji: "💰" },
        { text: "📍 Find a centre", emoji: "📍" },
        { text: "🤝 Franchise info", emoji: "🤝" }
    ];

    const handleSendMessage = async (message: string) => {
        if (!message.trim()) return;

        // User message
        setMessages(prev => [...prev, { text: message, isBot: false }]);
        setInputMessage('');
        setIsTyping(true);

        // Simulate thinking time natural to reading length
        const typingTime = Math.min(1000 + message.length * 20, 2500);

        setTimeout(() => {
            let response = "I'm here to help! could you please share more details? 😊";
            const lowerMsg = message.toLowerCase();

            if (lowerMsg.includes('admission') || lowerMsg.includes('join') || lowerMsg.includes('enroll')) {
                response = "Admissions are open! 🎒 We accept children from 1.5 to 5.5 years. You can fill out the enquiry form on our Admissions page, and our team will contact you within 24 hours.";
            } else if (lowerMsg.includes('fee') || lowerMsg.includes('cost') || lowerMsg.includes('price')) {
                response = "Our fee structure is designed to be affordable while maintaining premium quality standards. 💰 exact fees depend on your location. Would you like to locate the nearest centre?";
            } else if (lowerMsg.includes('centre') || lowerMsg.includes('location') || lowerMsg.includes('near me')) {
                response = "We have over 250+ centres across India! 🗺️ You can use the 'Locate a Centre' feature in the menu to find the one closest to you.";
            } else if (lowerMsg.includes('franchise') || lowerMsg.includes('business') || lowerMsg.includes('partner')) {
                response = "Join the T.I.M.E. Kids success story! 🤝 We offer a proven franchise model. Please visit our Franchise Opportunity page to apply.";
            } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
                response = "Hello! 👋 How can I make your day brighter?";
            }

            setMessages(prev => [...prev, { text: response, isBot: true }]);
            setIsTyping(false);
        }, typingTime);
    };

    return (
        <>
            {/* Floating Child Character Button */}
            {!isOpen && (
                <div className="fixed bottom-6 right-6 z-[9999]">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="relative group cursor-pointer focus:outline-none"
                        aria-label="Open chat"
                    >
                        {/* Pulsing background effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-pink-400 to-purple-400 rounded-full blur-xl opacity-60 group-hover:opacity-80 animate-pulse"></div>

                        {/* Character container */}
                        <div className="relative transform transition-all duration-300 group-hover:scale-110">
                            {/* Speech bubble - Animates in/out */}
                            <div
                                className={`absolute -top-14 -left-20 bg-white px-4 py-2 rounded-2xl shadow-xl transition-all duration-500 transform ${showBubble || isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-90'
                                    }`}
                            >
                                <p className="text-sm font-bold text-primary-600 whitespace-nowrap">Click to chat! 👋</p>
                                <div className="absolute bottom-0 right-8 transform translate-y-1/2 rotate-45 w-4 h-4 bg-white"></div>
                            </div>

                            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                                <MessageCircle className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </button>
                </div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[550px] sm:h-[600px] flex flex-col z-[9999] animate-scale-in">
                    {/* Decorative background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-3xl opacity-20 blur-2xl"></div>

                    {/* Main chat container */}
                    <div className="relative bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border-4 border-gradient-to-br from-yellow-300 via-pink-300 to-purple-300 h-full">
                        {/* Header with child character */}
                        <div className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-white p-4 relative overflow-hidden flex-shrink-0">
                            {/* Animated background shapes */}
                            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
                            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-12 translate-y-12"></div>

                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce-slow">
                                        <span className="text-2xl">👋</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">T.I.M.E. Kids Helper</h3>
                                        <p className="text-xs text-white/90 flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                            Online & ready to help!
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/20 rounded-full transition-all duration-300 hover:rotate-90 text-white"
                                    aria-label="Close chat"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Messages area with fun background */}
                        <div 
                            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-blue-50/30 to-purple-50/30"
                            onWheel={(e) => e.stopPropagation()}
                            style={{ overflowY: 'auto', scrollBehavior: 'smooth' }}
                        >
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-slide-in`}
                                >
                                    {message.isBot && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center mr-2 flex-shrink-0 shadow-md">
                                            <span className="text-sm">🤖</span>
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[75%] p-4 rounded-2xl shadow-md ${message.isBot
                                            ? 'bg-white text-gray-800 rounded-tl-none border-2 border-purple-200'
                                            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-tr-none'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed">{message.text}</p>
                                    </div>
                                    {!message.isBot && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center ml-2 flex-shrink-0 shadow-md">
                                            <span className="text-sm">😊</span>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="flex justify-start animate-slide-in">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center mr-2 flex-shrink-0 shadow-md">
                                        <span className="text-sm">🤖</span>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border-2 border-purple-200 shadow-md flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Questions */}
                        <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-t-2 border-purple-200 flex-shrink-0">
                            <p className="text-xs font-semibold text-purple-600 mb-2 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Quick questions:
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {quickQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSendMessage(question.text)}
                                        className="text-xs px-3 py-2 bg-white text-purple-600 rounded-xl hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md font-medium border-2 border-purple-200 hover:border-transparent transform hover:scale-105 truncate"
                                    >
                                        {question.text}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Input area */}
                        <div className="p-4 bg-white border-t-2 border-purple-200 flex-shrink-0">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                                    placeholder="Type your message... ✨"
                                    className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm placeholder:text-gray-400"
                                />
                                <button
                                    onClick={() => handleSendMessage(inputMessage)}
                                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!inputMessage.trim()}
                                    aria-label="Send message"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes bounce-slow {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }

                @keyframes scale-in {
                    0% {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                @keyframes slide-in {
                    0% {
                        transform: translateY(10px);
                        opacity: 0;
                    }
                    100% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                @keyframes spin-slow {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }

                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }

                    transform-origin: bottom center;
                }

                .animate-scale-in {
                    animation: scale-in 0.3s ease-out;
                }

                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }

                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            `}</style>
        </>
    );
};

export default Chatbot;
