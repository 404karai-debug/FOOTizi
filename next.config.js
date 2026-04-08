/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['upload.wikimedia.org', 'logos-world.net', 'crests.football-data.org'],
    unoptimized: true
  }
}

module.exports = nextConfig
