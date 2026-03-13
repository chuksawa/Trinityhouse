/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/trinityhouse",
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: "/trinityhouse",
  },
};

export default nextConfig;
