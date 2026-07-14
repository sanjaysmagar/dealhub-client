/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/post-type/deal', destination: '/submit'    },
    ];
  },
};

export default nextConfig;