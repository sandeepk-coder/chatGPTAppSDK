import type { NextConfig } from "next";
import { baseURL } from "./baseUrl";

const nextConfig: NextConfig = {
  assetPrefix: process.env.NODE_ENV === "production" ? "http://localhost:3000" : baseURL,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    API_URL: process.env.API_URL,
  },
  // experimental: {
  //   turbopack: false, // Disable Turbopack
  // },
};




export default nextConfig;
