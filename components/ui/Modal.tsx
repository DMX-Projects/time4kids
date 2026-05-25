'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    children,
    title,
    size = 'md'
}) => {
    const modalContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Prevent background scroll
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            // Restore background scroll
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }

        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'sm:max-w-md',
        md: 'sm:max-w-2xl',
        lg: 'sm:max-w-4xl',
        xl: 'sm:max-w-6xl',
    };

    // Prevent wheel event from bubbling to background
    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
    };

    const modalTree = (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#1e293b]/95 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content - Fixed height structure */}
            <div
                ref={modalContentRef}
                className={`relative isolate bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-[100vw] ${sizes[size]} h-auto max-h-[92dvh] sm:max-h-[85vh] flex flex-col animate-scale-in overflow-hidden z-[10000]`}
                onWheel={handleWheel}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Fixed at top */}
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0 bg-white">
                        <h2 className="text-xl font-bold font-display text-gray-900">{title}</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}
                {!title && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onClose();
                        }}
                        className="absolute right-3 top-3 z-[10050] rounded-lg bg-white/90 p-2 shadow-sm ring-1 ring-gray-200/80 hover:bg-gray-100 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                {/* Body - scroll layer stays below the absolute close control (Framer transforms can steal clicks at z-10). */}
                <div
                    className={`relative z-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 overscroll-contain ${!title ? 'pt-12' : ''}`}
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        scrollBehavior: 'smooth'
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );

    if (typeof document === 'undefined') return null;
    return createPortal(modalTree, document.body);
};

export default Modal;
