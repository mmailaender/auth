import { convexBetterAuthNextJs } from '@convex-dev/better-auth/nextjs';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
	throw new Error('NEXT_PUBLIC_CONVEX_URL must be set.');
}

const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? process.env.CONVEX_SITE_URL;
if (!convexSiteUrl) {
	throw new Error('NEXT_PUBLIC_CONVEX_SITE_URL or CONVEX_SITE_URL must be set.');
}

export const { fetchAuthQuery, getToken, handler } = convexBetterAuthNextJs({
	convexUrl,
	convexSiteUrl
});
