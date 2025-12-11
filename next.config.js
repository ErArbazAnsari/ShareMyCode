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
    // Allow network access when testing on LAN devices (dev only)
    allowedDevOrigins: ["http://localhost:3000", "http://192.168.1.6:3000"],
    serverExternalPackages: ["mongodb"],
};

module.exports = nextConfig;
