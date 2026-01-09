'use client';

/**
 * Three Dots Pulse Loader
 * Simple pulsing dots - lightweight and clean
 */
export default function MiniLoader() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
            {/* Three pulsing dots */}
            <div className="flex gap-1.5">
                <div
                    className="w-2.5 h-2.5 bg-orange-500 rounded-full"
                    style={{ animation: 'pulse 1.4s ease-in-out infinite' }}
                />
                <div
                    className="w-2.5 h-2.5 bg-orange-500 rounded-full"
                    style={{ animation: 'pulse 1.4s ease-in-out 0.2s infinite' }}
                />
                <div
                    className="w-2.5 h-2.5 bg-orange-500 rounded-full"
                    style={{ animation: 'pulse 1.4s ease-in-out 0.4s infinite' }}
                />
            </div>
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
            `}</style>
        </div>
    );
}
