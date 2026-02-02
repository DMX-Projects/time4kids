/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['localhost', '127.0.0.1', '103.65.21.176'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: '103.65.21.176',
                port: '8001',
                pathname: '/media/**',
            },
        ],
        formats: ['image/avif', 'image/webp'],
    },
    reactStrictMode: true,
    // Performance optimizations
    compress: true,
    poweredByHeader: false,
    // Optimize font loading
    optimizeFonts: true,
    // Faster compilation in development
    swcMinify: true,
    // Enable prefetching for better navigation performance
    experimental: {
        optimizeCss: true,
        // Reduce compilation time
        optimizePackageImports: ['lucide-react', 'framer-motion', 'gsap'],
    },
    // Webpack optimizations for faster builds
    webpack: (config, { dev, isServer }) => {
        if (dev && !isServer) {
            // Faster refresh in development
            config.watchOptions = {
                poll: 1000,
                aggregateTimeout: 300,
            };
        }
        return config;
    },
}

module.exports = nextConfig
