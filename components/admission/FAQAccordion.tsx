'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
}

const FAQAccordion = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs: FAQItem[] = [
        {
            question: 'What is the admission process?',
            answer: 'Fill out the enquiry form, schedule a school tour, meet with our counselor, complete the registration form, and submit required documents. We will guide you through each step.'
        },
        {
            question: 'What documents are required for admission?',
            answer: 'Birth certificate of the child, recent passport-size photographs, address proof, and parent ID proof. Additional documents may be required based on the program.'
        },
        {
            question: 'What is the fee structure?',
            answer: 'Fee structure varies by location and program. Please contact your nearest T.I.M.E. Kids centre or fill the enquiry form for detailed fee information.'
        },
        {
            question: 'Is there a trial class available?',
            answer: 'Yes, we offer trial classes so your child can experience our learning environment. Contact your nearest centre to schedule a trial class.'
        },
        {
            question: 'What is the student-teacher ratio?',
            answer: 'We maintain a low student-teacher ratio of 1:10 to ensure personalized attention for every child.'
        },
        {
            question: 'Are meals provided?',
            answer: 'Nutritious snacks and meals are provided for children enrolled in full-day programs and day care. We follow strict hygiene standards.'
        },
        {
            question: 'What safety measures are in place?',
            answer: 'We have CCTV surveillance, secure entry/exit points, trained staff, child-safe furniture and equipment, and regular safety drills.'
        },
        {
            question: 'Can parents visit the school?',
            answer: 'Yes, we encourage parents to schedule a visit. You can tour our facilities, meet our teachers, and understand our curriculum and approach.'
        },
    ];

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg"
                    >
                        <button
                            onClick={() => toggleFAQ(index)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                        >
                            <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                            <ChevronDown
                                className={`w-5 h-5 text-primary-600 flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>
                        <div
                            className={`transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                } overflow-hidden`}
                        >
                            <div className="px-6 pb-4 text-gray-700 leading-relaxed">
                                {faq.answer}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQAccordion;
