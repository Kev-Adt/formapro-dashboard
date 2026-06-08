import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Turbopack panics on non-ASCII characters in the project path ("Mío").
  // Webpack is used as the bundler instead.
  turbopack: {},
}

export default nextConfig
