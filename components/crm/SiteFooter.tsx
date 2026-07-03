'use client';

const SOCIAL_LINKS = {
  youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || 'https://www.youtube.com/@timekids',
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://www.facebook.com/timekids',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/timekids',
} as const;

const COPYRIGHT = '(C) Copyright TIMEKIDS Private Limited.';

interface SiteFooterProps {
  className?: string;
}

export function SiteFooter({ className = '' }: SiteFooterProps) {
  return (
    <footer className={`mt-auto pt-6 pb-4 text-center ${className}`}>
      <div className="flex justify-center gap-6 mb-3">
        <a
          href={SOCIAL_LINKS.youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-red-600 transition-colors"
          aria-label="YouTube"
        >
          YouTube
        </a>
        <a
          href={SOCIAL_LINKS.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-blue-600 transition-colors"
          aria-label="Facebook"
        >
          Facebook
        </a>
        <a
          href={SOCIAL_LINKS.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-pink-600 transition-colors"
          aria-label="Instagram"
        >
          Instagram
        </a>
      </div>
      <p className="text-sm text-gray-600">{COPYRIGHT}</p>
    </footer>
  );
}
