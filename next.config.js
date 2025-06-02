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
}

module.exports = nextConfig
