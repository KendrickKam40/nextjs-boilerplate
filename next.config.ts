import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
};