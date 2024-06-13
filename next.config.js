/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          "dungbui1110-nextjs-foodies-image.s3.ap-southeast-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
        port: "",
      },
    ],
  },
};

module.exports = nextConfig;
