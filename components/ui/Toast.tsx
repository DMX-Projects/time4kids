"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "success") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
                            className="pointer-events-auto"
                        >
                            <div className={`
                                flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border min-w-[320px] max-w-md
                                ${toast.type === 'success' ? 'bg-white border-green-100' :
                                    toast.type === 'error' ? 'bg-white border-red-100' :
                                        'bg-white border-blue-100'}
                            `}>
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center shrink-0
                                    ${toast.type === 'success' ? 'bg-green-50 text-green-600' :
                                        toast.type === 'error' ? 'bg-red-50 text-red-600' :
                                            'bg-blue-50 text-blue-600'}
                                `}>
                                    {toast.type === 'success' && <CheckCircle size={24} />}
                                    {toast.type === 'error' && <XCircle size={24} />}
                                    {toast.type === 'info' && <Info size={24} />}
                                </div>

                                <div className="flex-1">
                                    <p className="font-fredoka font-semibold text-gray-900 leading-tight">
                                        {toast.type === 'success' ? 'Success!' : toast.type === 'error' ? 'Oops!' : 'Note'}
                                    </p>
                                    <p className="text-gray-600 text-sm font-medium mt-0.5">
                                        {toast.message}
                                    </p>
                                </div>

                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
