/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  experimental: {
    allowedDevOrigins: ['http://127.0.0.1:3000', 'http://localhost:3000'],
  },
};

export default nextConfig;

