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
     * Proxy browser requests `http://localhost:3000/api/...` → Django so `/api/*` is never answered by Next (would be 404).
     */
    async rewrites() {
        const isDev = process.env.NODE_ENV === 'development';
        const djangoBase = isDev ? djangoFromEnv || djangoDevFallback : djangoFromEnv;
        if (!djangoBase) return [];
        return [
            // Preserve trailing slashes to avoid Django APPEND_SLASH 301s via the proxy.
            { source: '/api/:path*/', destination: `${djangoBase}/api/:path*/` },
            { source: '/api/:path*', destination: `${djangoBase}/api/:path*` },
            { source: '/media/:path*/', destination: `${djangoBase}/media/:path*/` },
            { source: '/media/:path*', destination: `${djangoBase}/media/:path*` },
        ];
    },
};

module.exports = nextConfig;
