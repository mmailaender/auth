import { convexBetterAuthNextJs } from '@convex-dev/better-auth/nextjs';

const requireEnv = (name: string) => {
	const value = process.env[name];
	if (!value) {
		throw new Error(`${name} must be set.`);
	}
	return value;
};

export const { fetchAuthQuery, handler } = convexBetterAuthNextJs({
	convexUrl: requireEnv('NEXT_PUBLIC_CONVEX_URL'),
	convexSiteUrl: requireEnv('CONVEX_SITE_URL')
});
