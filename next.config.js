/** @type {import('next').NextConfig} */
/** Django server URL — Next proxies `/api` and `/media` here in dev (and when env is set for local prod runs). */
const djangoFromEnv = (
    process.env.DJANGO_DEV_BACKEND_URL ||
    process.env.INTERNAL_API_URL ||
    ''
).replace(/\/$/, '');
const djangoPort = process.env.NEXT_PUBLIC_BACKEND_PORT || '8000';
const djangoDevFallback = `http://127.0.0.1:${djangoPort}`;
/** Same-server production: gunicorn on localhost when INTERNAL_API_URL is unset. */
const djangoProdFallback = `http://127.0.0.1:${djangoPort}`;

const nextConfig = {
    trailingSlash: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        /**
         * When `localPatterns` is set, only listed paths work with `next/image`.
         * Include `public/` assets (logos, icons) and Django proxy paths.
         */
        localPatterns: [
            { pathname: '/cms-media/**' },
            { pathname: '/media/**' },
            { pathname: '/**' },
        ],
        remotePatterns: [
            { protocol: 'http', hostname: 'localhost', pathname: '/cms-media/**' },
            { protocol: 'http', hostname: 'localhost', pathname: '/media/**' },
            { protocol: 'http', hostname: '127.0.0.1', pathname: '/cms-media/**' },
            { protocol: 'http', hostname: '127.0.0.1', pathname: '/media/**' },
            { protocol: 'http', hostname: 'localhost' },
            { protocol: 'http', hostname: '127.0.0.1' },
            { protocol: 'https', hostname: 'localhost' },
            { protocol: 'https', hostname: '127.0.0.1' },
            { protocol: 'https', hostname: 'www.timekidspreschools.in', pathname: '/cms-media/**' },
            { protocol: 'https', hostname: 'timekidspreschools.in', pathname: '/cms-media/**' },
            { protocol: 'https', hostname: 'www.timekidspreschools.in', pathname: '/api/cms-files/**' },
            { protocol: 'https', hostname: 'timekidspreschools.in', pathname: '/api/cms-files/**' },
            { protocol: 'https', hostname: 'www.timekidspreschools.in', pathname: '/media/**' },
            { protocol: 'https', hostname: 'timekidspreschools.in', pathname: '/media/**' },
            { protocol: 'https', hostname: 'www.timekidspreschools.in', pathname: '/**' },
            { protocol: 'https', hostname: 'timekidspreschools.in', pathname: '/**' },
            { protocol: 'https', hostname: 'timekids1.t4e.in', pathname: '/media/**' },
            { protocol: 'https', hostname: 'timekids1.t4e.in', pathname: '/cms-media/**' },
            { protocol: 'https', hostname: 'timekids1.t4e.in', pathname: '/api/cms-files/**' },
            {
                protocol: 'http',
                hostname: '103.65.21.176',
                port: '8001',
                pathname: '/media/**',
            },
        ],
        formats: ['image/avif', 'image/webp'],
    },
    reactStrictMode: false,
    compress: true,
    poweredByHeader: false,
    optimizeFonts: true,
    swcMinify: true,
    /**
     * Old public URL was `/media/` — on many live stacks nginx serves Django uploads under `/media/`,
     * so the gallery page got 403. Gallery UI now lives at `/gallery/`. These help when the request reaches Next.
     */
    async redirects() {
        return [
            { source: '/media', destination: '/gallery/', permanent: true },
            { source: '/media/', destination: '/gallery/', permanent: true },
            { source: '/tv-commercial', destination: '/gallery/', permanent: true },
            { source: '/tv-commercial/', destination: '/gallery/', permanent: true },
            /** Nopaper franchise form — legacy thank-you URLs (form unchanged; static TY page) */
            { source: '/timekids-2g/thank-you.html', destination: '/thank-you.html', permanent: false },
            { source: '/timekids-2g/thank-you-fb.html', destination: '/thank-you-fb.html', permanent: false },
            { source: '/timekids-2g/pages/thank-you.html', destination: '/thank-you.html', permanent: false },
            { source: '/timekids-2g/pages/thank-you-fb.html', destination: '/thank-you-fb.html', permanent: false },
            { source: '/franchise/thank-you', destination: '/thank-you.html', permanent: false },
            { source: '/franchise/thank-you/', destination: '/thank-you.html', permanent: false },
        ];
    },
    async rewrites() {
        const landingPageRewrites = [
            { source: '/Timekids-meta-feb', destination: '/Timekids-meta-feb/index.html' },
            { source: '/Timekids-meta-feb/', destination: '/Timekids-meta-feb/index.html' },
            { source: '/Timekids-lp-feb', destination: '/Timekids-lp-feb/index.html' },
            { source: '/Timekids-lp-feb/', destination: '/Timekids-lp-feb/index.html' },
            { source: '/Timekids-meta-july', destination: '/Timekids-meta-july/index.html' },
            { source: '/Timekids-meta-july/', destination: '/Timekids-meta-july/index.html' },
            { source: '/Timekids-lp-july', destination: '/Timekids-lp-july/index.html' },
            { source: '/Timekids-lp-july/', destination: '/Timekids-lp-july/index.html' },
        ];
        const isDev = process.env.NODE_ENV === 'development';
        const djangoBase = isDev
            ? djangoFromEnv || djangoDevFallback
            : djangoFromEnv || djangoProdFallback;
        if (!djangoBase) return landingPageRewrites;
        return [
            ...landingPageRewrites,
            { source: '/admin/:path*/', destination: `${djangoBase}/admin/:path*/` },
            { source: '/admin/:path*', destination: `${djangoBase}/admin/:path*` },
            { source: '/static/:path*/', destination: `${djangoBase}/static/:path*/` },
            { source: '/static/:path*', destination: `${djangoBase}/static/:path*` },
            // Preserve trailing slashes to avoid Django APPEND_SLASH 301s via the proxy.
            { source: '/api/:path*/', destination: `${djangoBase}/api/:path*/` },
            { source: '/api/:path*', destination: `${djangoBase}/api/:path*` },
            { source: '/media/:path*/', destination: `${djangoBase}/media/:path*/` },
            { source: '/media/:path*', destination: `${djangoBase}/media/:path*` },
            /** `/cms-media/*` is served by `app/cms-media/[[...path]]/route.ts` (Django proxy + public fallbacks). */
        ];
    },
    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion', 'gsap'],
    },
    webpack: (config, { dev, isServer }) => {
        if (dev && !isServer) {
            config.watchOptions = {
                poll: 1000,
                aggregateTimeout: 600,
            };
        }
        return config;
    },
};

module.exports = nextConfig;
