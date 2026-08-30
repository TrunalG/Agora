import dns from 'dns'
try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
  console.log('[Agora DNS Bootstrap] Global Google DNS servers configured.')
} catch (e) {
  console.warn('[Agora DNS Bootstrap] Could not configure global DNS:', e)
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
