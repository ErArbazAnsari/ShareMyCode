/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        domains: ["res.cloudinary.com", "img.clerk.com"],
        unoptimized: true,
    },
    serverExternalPackages: ["mongodb"],
    experimental: {
        serverActions: {
            bodySizeLimit: "200mb",
        },
    },
    // Production optimizations
    compress: true,
    poweredByHeader: false,
    reactStrictMode: true,
};

module.exports = nextConfig;
