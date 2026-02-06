import React from 'react';

// --- Types ---
interface DecorationProps {
    className?: string;
    style?: React.CSSProperties;
}

// --- Pastel Blobs ---
export const PastelBlob: React.FC<DecorationProps & { color?: string; shape?: '1' | '2' | '3' }> = ({ className, style, color = '#FFDEE9', shape = '1' }) => {
    const shapes = {
        '1': '30% 70% 70% 30% / 30% 30% 70% 70%',
        '2': '63% 37% 30% 70% / 50% 45% 55% 50%',
        '3': '40% 60% 60% 40% / 40% 60% 40% 60%',
    };

    return (
        <div
            className={`absolute -z-10 opacity-70 ${className}`}
            style={{
                borderRadius: shapes[shape],
                backgroundColor: color,
                width: '200px',
                height: '200px',
                filter: 'blur(40px)',
                ...style,
            }}
        />
    );
};

// --- Vector School Bus ---
export const CuteSchoolBus: React.FC<DecorationProps> = ({ className, style }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 120"
        className={className} // No predefined w/h to allow external sizing
        style={style}
    >
        {/* Body */}
        <path d="M20,40 Q20,10 50,10 L150,10 Q180,10 180,40 V90 H20 V40 Z" fill="#FF5252" /> {/* Bright Red Top */}
        <rect x="20" y="60" width="160" height="40" fill="#FFC107" /> {/* Yellow Bottom */}
        <path d="M20,60 L20,90 Q20,100 30,100 H170 Q180,100 180,90 V60 H20 Z" fill="#FFC107" />

        {/* Windows */}
        <rect x="35" y="25" width="30" height="25" rx="5" fill="#E3F2FD" stroke="#B0BEC5" strokeWidth="2" />
        <rect x="75" y="25" width="30" height="25" rx="5" fill="#E3F2FD" stroke="#B0BEC5" strokeWidth="2" />
        <rect x="115" y="25" width="30" height="25" rx="5" fill="#E3F2FD" stroke="#B0BEC5" strokeWidth="2" />

        {/* Wheels */}
        <circle cx="50" cy="100" r="12" fill="#333" />
        <circle cx="50" cy="100" r="5" fill="#DDD" />
        <circle cx="150" cy="100" r="12" fill="#333" />
        <circle cx="150" cy="100" r="5" fill="#DDD" />

        {/* Details (Headlights, Bumper) */}
        <path d="M180,75 L185,75 L185,85 L180,85 Z" fill="#FFEB3B" /> {/* Light */}
        <rect x="15" y="90" width="170" height="8" rx="2" fill="#555" /> {/* Bumper */}

        {/* Simple "Kids" Hints inside windows */}
        <circle cx="50" cy="45" r="8" fill="#FFCCBC" /> {/* Head 1 */}
        <path d="M44,48 Q50,55 56,48" stroke="#D84315" strokeWidth="1" fill="none" /> {/* Smile */}

        <circle cx="90" cy="42" r="8" fill="#FFAB91" /> {/* Head 2 */}
        <path d="M84,45 Q90,52 96,45" stroke="#D84315" strokeWidth="1" fill="none" />

        <circle cx="130" cy="46" r="8" fill="#FFE0B2" /> {/* Head 3 */}
        <path d="M124,49 Q130,56 136,49" stroke="#D84315" strokeWidth="1" fill="none" />
    </svg>
);

// --- Doodles (Clouds, Stars, Balloons) ---
export const FloatingCloud: React.FC<DecorationProps> = ({ className, style }) => (
    <svg viewBox="0 0 100 60" className={className} style={style}>
        <path d="M20,40 Q10,40 10,30 Q10,15 25,15 Q30,5 50,5 Q70,5 75,15 Q90,15 90,30 Q90,40 80,40 Z" fill="white" stroke="#E1F5FE" strokeWidth="2" />
    </svg>
);

export const PlayfulStar: React.FC<DecorationProps & { fill?: string }> = ({ className, style, fill = "#FFEB3B" }) => (
    <svg viewBox="0 0 50 50" className={className} style={{ ...style, filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))' }}>
        <path d="M25,2 L32,18 L48,19 L36,30 L40,46 L25,37 L10,46 L14,30 L2,19 L18,18 Z" fill={fill} stroke="none" rx="5" strokeLinejoin="round" />
    </svg>
);

export const FloatingBalloon: React.FC<DecorationProps & { color?: string }> = ({ className, style, color = "#81D4FA" }) => (
    <svg viewBox="0 0 60 80" className={className} style={style}>
        <path d="M30,2 C15,2 5,15 5,30 C5,45 25,55 30,55 C35,55 55,45 55,30 C55,15 45,2 30,2 Z" fill={color} />
        <path d="M30,55 Q35,65 30,80" stroke="#888" strokeWidth="2" fill="none" />
        <ellipse cx="20" cy="15" rx="5" ry="8" fill="rgba(255,255,255,0.4)" transform="rotate(-30 20 15)" /> {/* Highlight */}
    </svg>
);


// --- Main Background Container ---
export const PreschoolBackground: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    return (
        <div className={`relative w-full overflow-hidden bg-gradient-to-br from-blue-50 to-pink-50 ${className}`}>
            {/* Decorative Layer */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Left Side Doodles */}
                <PastelBlob color="#E1F5FE" shape="1" className="left-[-50px] top-[10%] w-[300px] h-[300px]" />
                <FloatingBalloon color="#FFCDD2" className="absolute left-[5%] top-[20%] w-16 h-24 animate-bounce-slow" style={{ animationDuration: '4s' }} />
                <PlayfulStar className="absolute left-[10%] top-[40%] w-8 h-8 animate-spin-slow" />
                <FloatingCloud className="absolute left-[-20px] bottom-[20%] w-40 h-24 opacity-80" />

                {/* Right Side Doodles */}
                <PastelBlob color="#FFF9C4" shape="2" className="right-[-50px] top-[15%] w-[400px] h-[400px]" />
                <FloatingBalloon color="#C8E6C9" className="absolute right-[8%] top-[10%] w-14 h-20 animate-bounce-slow" style={{ animationDuration: '5s' }} />
                <PlayfulStar fill="#AB47BC" className="absolute right-[5%] top-[60%] w-6 h-6" />
                <FloatingCloud className="absolute right-[-10px] bottom-[30%] w-48 h-28 opacity-60" />

                {/* Bottom Doodle - Bus driving by? */}
                <CuteSchoolBus className="absolute -right-10 bottom-10 w-48 h-32 opacity-90 transform -scale-x-100" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};

export default PreschoolBackground;
