"use client";

import React from "react";
import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle, HelpCircle, Info } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
    isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "info",
    isLoading = false,
}) => {
    const getIcon = () => {
        switch (variant) {
            case "danger":
                return <AlertTriangle className="w-10 h-10 text-red-500" />;
            case "warning":
                return <AlertTriangle className="w-10 h-10 text-orange-500" />;
            default:
                return <HelpCircle className="w-10 h-10 text-blue-500" />;
        }
    };

    const getColors = () => {
        switch (variant) {
            case "danger":
                return {
                    bg: "bg-red-50",
                    border: "border-red-100",
                    button: "bg-red-600 hover:bg-red-700 text-white shadow-red-100",
                };
            case "warning":
                return {
                    bg: "bg-orange-50",
                    border: "border-orange-100",
                    button: "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-100",
                };
            default:
                return {
                    bg: "bg-blue-50",
                    border: "border-blue-100",
                    button: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100",
                };
        }
    };

    const colors = getColors();

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="flex flex-col items-center text-center py-2">
                <div className={`p-4 rounded-full ${colors.bg} mb-4`}>
                    {getIcon()}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
                    {description}
                </p>

                <div className="flex flex-col w-full gap-3">
                    <Button
                        className={`w-full !h-12 !rounded-xl font-bold shadow-lg ${colors.button}`}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full !h-12 !rounded-xl font-semibold border-gray-200 text-gray-600 hover:bg-gray-50"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
