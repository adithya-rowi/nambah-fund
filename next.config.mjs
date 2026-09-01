/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure the north-star markdown is bundled into the serverless function that
  // reads it at runtime (otherwise it's missing on Vercel and the AI loses it).
  outputFileTracingIncludes: {
    "/api/chat": ["./Principles/**"],
  },
};

export default nextConfig;
