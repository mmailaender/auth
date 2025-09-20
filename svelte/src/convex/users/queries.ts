import { query } from '../_generated/server';
import { ConvexError, v } from 'convex/values';
import { authComponent, createAuth } from '../auth';
import { APIError } from 'better-auth/api';
import { components } from '../_generated/api';

/**
 * Check if a user with the given email exists. Works also in a non-authenticated context.
 */
export const isUserExisting = query({
	args: {
		email: v.string()
	},
	handler: async (ctx, args) => {
		const user = await ctx.runQuery(components.betterAuth.user.getUserByEmail, {
			email: args.email
		});
		return user !== null;
	}
});

/**
 * Return the currently authenticated user
 */
export const getActiveUser = query({
	handler: async (ctx) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user) {
			return null;
		}

		try {
			const auth = createAuth(ctx);
			const session = await auth.api.getSession({
				headers: await authComponent.getHeaders(ctx)
			});
			return session?.user;
		} catch (error) {
			if (error instanceof APIError) {
				throw new ConvexError(`${error.statusCode} ${error.status} ${error.message}`);
			} else {
				console.error('Unexpected error getting session:', error);
				throw new ConvexError('An unexpected error occurred while getting the session');
			}
		}
	}
});

export const listAccounts = query({
	handler: async (ctx) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user) {
			return null;
		}

		try {
			const auth = createAuth(ctx);
			const accounts = await auth.api.listUserAccounts({
				headers: await authComponent.getHeaders(ctx)
			});
			return accounts;
		} catch (error) {
			if (error instanceof APIError) {
				if (error.statusCode === 401) {
					return [];
				}
			}
			throw error;
		}
	}
});
