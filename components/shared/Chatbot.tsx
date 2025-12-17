'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean }>>([
        { text: "Hello! How can I help you today?", isBot: true }
    ]);
    const [inputMessage, setInputMessage] = useState('');

    const quickQuestions = [
        "Admission process?",
        "Fee structure?",
        "Locate nearest centre",
        "Franchise enquiry"
    ];

    const handleSendMessage = (message: string) => {
        if (!message.trim()) return;

        setMessages(prev => [...prev, { text: message, isBot: false }]);
        setInputMessage('');

        // Simulate bot response
        setTimeout(() => {
            let response = "Thank you for your query. Please email us at info@timekids.com or call +91 123 456 7890 for detailed information.";

            if (message.toLowerCase().includes('admission')) {
                response = "For admission enquiries, please visit our Admission page or contact your nearest T.I.M.E. Kids centre. You can also fill out the enquiry form on our website.";
            } else if (message.toLowerCase().includes('fee')) {
                response = "Fee structure varies by location and program. Please visit our Admission page or contact your nearest centre for detailed fee information.";
            } else if (message.toLowerCase().includes('centre') || message.toLowerCase().includes('location')) {
                response = "You can find your nearest T.I.M.E. Kids centre using our 'Locate Centre' page. We have 250+ centres across India!";
            } else if (message.toLowerCase().includes('franchise')) {
                response = "Interested in a T.I.M.E. Kids franchise? Visit our Franchise page to learn more about the opportunity and fill out the enquiry form.";
            }

            setMessages(prev => [...prev, { text: response, isBot: true }]);
        }, 1000);
    };

    return (
        <>
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center z-50 animate-float"
                >
                    <MessageCircle className="w-7 h-7" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 animate-scale-in">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold">T.I.M.E. Kids Support</h3>
                                <p className="text-xs text-white/80">We&apos;re here to help!</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl ${message.isBot
                                        ? 'bg-gray-100 text-gray-800'
                                        : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                                        }`}
                                >
                                    <p className="text-sm">{message.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Questions */}
                    <div className="px-4 py-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                        <div className="flex flex-wrap gap-2">
                            {quickQuestions.map((question, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSendMessage(question)}
                                    className="text-xs px-3 py-1 bg-primary-50 text-primary-600 rounded-full hover:bg-primary-100 transition-colors"
                                >
                                    {question}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                                onClick={() => handleSendMessage(inputMessage)}
                                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
