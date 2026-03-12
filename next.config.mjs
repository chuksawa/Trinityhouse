/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/trinityhouse",
  trailingSlash: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
