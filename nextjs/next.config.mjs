import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: convexUrl
		? {
				remotePatterns: [
					{
						protocol: 'https',
						hostname: convexUrl.replace('https://', '')
					}
				]
			}
		: {},
	turbopack: {
		root: join(__dirname, '..')
	}
};

export default nextConfig;
