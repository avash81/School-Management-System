/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE:
      process.env.NEXT_PUBLIC_API_BASE ?? `http://localhost:${process.env.API_PORT ?? '4000'}/api/v1`,
  },
};

export default nextConfig;
