'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
    value: string;
    size?: number;
    level?: 'L' | 'M' | 'Q' | 'H';
    includeMargin?: boolean;
    fgColor?: string;
    bgColor?: string;
}

const QRCode: React.FC<QRCodeProps> = ({
    value,
    size = 200,
    level = 'M',
    includeMargin = true,
    fgColor = '#000000',
    bgColor = '#ffffff',
}) => {
    return (
        <div className="inline-flex p-4 bg-white rounded-xl shadow-lg">
            <QRCodeSVG
                value={value}
                size={size}
                level={level}
                includeMargin={includeMargin}
                fgColor={fgColor}
                bgColor={bgColor}
            />
        </div>
    );
};

export default QRCode;
