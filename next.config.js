/** @type {import('next').NextConfig} */
/** Django server URL — Next proxies `/api` and `/media` here in dev (and when env is set for local prod runs). */
const djangoFromEnv = (process.env.DJANGO_DEV_BACKEND_URL || '').replace(/\/$/, '');
const djangoDevFallback = 'http://127.0.0.1:8000';

const nextConfig = {
    trailingSlash: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            { protocol: 'http', hostname: 'localhost' },
            { protocol: 'http', hostname: '127.0.0.1' },
            { protocol: 'https', hostname: 'localhost' },
            { protocol: 'https', hostname: '127.0.0.1' },
            { protocol: 'https', hostname: '**' },
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
    compress: false,
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

    /**
     * Proxy browser requests to Django in dev (and when DJANGO_DEV_BACKEND_URL is set).
     * - `/api/*` — REST API
     * - `/media/*` — uploaded files
     * - `/admin/*` — Django admin (proxied from the same host/port as Next dev, e.g. :3000 or :3001)
     * - `/static/*` — Django admin CSS/JS (DEBUG or after collectstatic)
     */
    async rewrites() {
        const isDev = process.env.NODE_ENV === 'development';
        const djangoBase = isDev ? djangoFromEnv || djangoDevFallback : djangoFromEnv;
        if (!djangoBase) return [];
        return [
            { source: '/admin/:path*/', destination: `${djangoBase}/admin/:path*/` },
            { source: '/admin/:path*', destination: `${djangoBase}/admin/:path*` },
            { source: '/static/:path*/', destination: `${djangoBase}/static/:path*/` },
            { source: '/static/:path*', destination: `${djangoBase}/static/:path*` },
            // Preserve trailing slashes to avoid Django APPEND_SLASH 301s via the proxy.
            { source: '/api/:path*/', destination: `${djangoBase}/api/:path*/` },
            { source: '/api/:path*', destination: `${djangoBase}/api/:path*` },
            { source: '/media/:path*/', destination: `${djangoBase}/media/:path*/` },
            { source: '/media/:path*', destination: `${djangoBase}/media/:path*` },
        ];
    },
};

module.exports = nextConfig;
