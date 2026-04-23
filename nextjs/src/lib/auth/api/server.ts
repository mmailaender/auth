import { convexBetterAuthNextJs } from '@convex-dev/better-auth/nextjs';

const requireEnv = (name: string) => {
	const value = process.env[name];
	if (!value) {
		throw new Error(`${name} must be set.`);
	}
	return value;
};

const requireOneEnv = (...names: string[]) => {
	for (const name of names) {
		const value = process.env[name];
		if (value) return value;
	}
	throw new Error(`${names.join(' or ')} must be set.`);
};

export const { fetchAuthQuery, handler } = convexBetterAuthNextJs({
	convexUrl: requireEnv('NEXT_PUBLIC_CONVEX_URL'),
	convexSiteUrl: requireOneEnv('NEXT_PUBLIC_CONVEX_SITE_URL', 'CONVEX_SITE_URL')
});
