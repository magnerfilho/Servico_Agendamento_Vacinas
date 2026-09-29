import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    serverExternalPackages: ['@libsql/client', '@kapso/whatsapp-cloud-api'],
};

export default nextConfig;
