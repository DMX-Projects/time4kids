import { useId, type SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function FacebookBrandIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden {...props}>
            <path
                fill="#1877F2"
                d="M13.397 8.088h2.264V5.22h-2.264c-2.18 0-3.948 1.768-3.948 3.948v1.92H7.22v2.912h2.865v7.48h3.312v-7.48h2.728l.272-2.912h-3v-1.92c0-.597.485-1.082 1.082-1.082z"
            />
        </svg>
    );
}

export function InstagramBrandIcon({ className, ...props }: IconProps) {
    const gradientId = useId();

    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden {...props}>
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F58529" />
                    <stop offset="35%" stopColor="#DD2A7B" />
                    <stop offset="68%" stopColor="#8134AF" />
                    <stop offset="100%" stopColor="#515BD4" />
                </linearGradient>
            </defs>
            <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke={`url(#${gradientId})`} strokeWidth="2" />
            <circle cx="12" cy="12" r="4.25" fill="none" stroke={`url(#${gradientId})`} strokeWidth="2" />
            <circle cx="17.35" cy="6.65" r="1.35" fill={`url(#${gradientId})`} />
        </svg>
    );
}

export function YoutubeBrandIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden {...props}>
            <path
                fill="#FF0000"
                d="M21.58 7.204a2.43 2.43 0 0 0-1.71-1.72C18.25 5 12 5 12 5s-6.25 0-7.87.484a2.43 2.43 0 0 0-1.71 1.72A25.13 25.13 0 0 0 2 12a25.13 25.13 0 0 0 .42 4.796 2.43 2.43 0 0 0 1.71 1.72C5.75 19 12 19 12 19s6.25 0 7.87-.484a2.43 2.43 0 0 0 1.71-1.72A25.13 25.13 0 0 0 22 12a25.13 25.13 0 0 0-.42-4.796zM10 15.464V8.536L15.818 12 10 15.464z"
            />
        </svg>
    );
}

export type SocialBrandPlatform = 'facebook' | 'instagram' | 'youtube';

const BRAND_ICON_MAP = {
    facebook: FacebookBrandIcon,
    instagram: InstagramBrandIcon,
    youtube: YoutubeBrandIcon,
} as const;

type SocialBrandLinkProps = {
    platform: SocialBrandPlatform;
    href: string;
    size?: 'xs' | 'sm' | 'md';
    className?: string;
};

const sizeClasses = {
    xs: { box: 'h-8 w-8 rounded-lg', icon: 'h-4 w-4' },
    sm: { box: 'h-9 w-9 rounded-xl', icon: 'h-5 w-5' },
    md: { box: 'h-12 w-12 rounded-2xl', icon: 'h-7 w-7' },
};

export function SocialBrandLink({ platform, href, size = 'md', className = '' }: SocialBrandLinkProps) {
    const Icon = BRAND_ICON_MAP[platform];
    const { box, icon } = sizeClasses[size];
    const label = platform.charAt(0).toUpperCase() + platform.slice(1);

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={`inline-flex shrink-0 items-center justify-center bg-white shadow-[0_2px_10px_rgba(15,23,42,0.12)] transition-transform hover:scale-110 ${box} ${className}`}
        >
            <Icon className={icon} />
        </a>
    );
}
