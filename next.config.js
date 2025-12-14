/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['nraxsxvjjffgrmfukjqf.supabase.co', 'vwowmqsrayznkiszemlp.supabase.co'],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // Exclude historical-faith-tracker sub-project from build
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/historical-faith-tracker/**'],
    };
    return config;
  },
}

module.exports = nextConfig
