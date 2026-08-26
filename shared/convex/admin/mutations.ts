import { mutation } from '../_generated/server';
import { ConvexError, v } from 'convex/values';
import { APIError } from 'better-auth/api';

import { authComponent, createAuth } from '../auth';
import { components } from '../_generated/api';
import { AUTH_CONSTANTS } from '../auth.constants';
import { assertNotSelf, requireAppAdmin } from '../model/admin';

/**
 * Translate Better Auth `APIError`s into `ConvexError`s, mirroring the
 * convention used across the other Convex wrappers.
 */
const toConvexError = (error: unknown): never => {
	if (error instanceof APIError) {
		throw new ConvexError(`${error.statusCode} ${error.status} ${error.message}`);
	}
	throw error;
};

/**
 * Create a new user (admin only).
 */
export const createUser = mutation({
	args: {
		email: v.string(),
		password: v.string(),
		name: v.string(),
		role: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		await requireAppAdmin(ctx);
		const auth = createAuth(ctx);
		try {
			return await auth.api.createUser({
				body: {
					email: args.email,
					password: args.password,
					name: args.name,
					role: (args.role ?? 'user') as 'admin' | 'user'
				},
				headers: await authComponent.getHeaders(ctx)
			});
		} catch (error) {
			return toConvexError(error);
		}
	}
});

/**
 * Set a user's application role (admin only). An admin cannot change their own
 * role to avoid self-lockout.
 */
export const setRole = mutation({
	args: {
		userId: v.string(),
		role: v.string()
	},
	handler: async (ctx, args) => {
		const admin = await requireAppAdmin(ctx);
		assertNotSelf(admin._id, args.userId, 'change the role of');
		const auth = createAuth(ctx);
		try {
			return await auth.api.setRole({
				body: { userId: args.userId, role: args.role as 'admin' | 'user' },
				headers: await authComponent.getHeaders(ctx)
			});
		} catch (error) {
			return toConvexError(error);
		}
	}
});

/**
 * Ban a user (admin only). `banExpiresIn` is a duration in seconds; omit for a
 * permanent ban.
 */
export const banUser = mutation({
	args: {
		userId: v.string(),
		banReason: v.optional(v.string()),
		banExpiresIn: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const admin = await requireAppAdmin(ctx);
		assertNotSelf(admin._id, args.userId, 'ban');
		const auth = createAuth(ctx);
		try {
			return await auth.api.banUser({
				body: {
					userId: args.userId,
					banReason: args.banReason,
					banExpiresIn: args.banExpiresIn
				},
				headers: await authComponent.getHeaders(ctx)
			});
		} catch (error) {
			return toConvexError(error);
		}
	}
});

/**
 * Lift a user's ban (admin only).
 */
export const unbanUser = mutation({
	args: { userId: v.string() },
	handler: async (ctx, args) => {
		await requireAppAdmin(ctx);
		const auth = createAuth(ctx);
		try {
			return await auth.api.unbanUser({
				body: { userId: args.userId },
				headers: await authComponent.getHeaders(ctx)
			});
		} catch (error) {
			return toConvexError(error);
		}
	}
});

/**
 * Permanently remove a user (admin only). An admin cannot remove themselves.
 */
export const removeUser = mutation({
	args: { userId: v.string() },
	handler: async (ctx, args) => {
		const admin = await requireAppAdmin(ctx);
		assertNotSelf(admin._id, args.userId, 'delete');
		const auth = createAuth(ctx);
		try {
			return await auth.api.removeUser({
				body: { userId: args.userId },
				headers: await authComponent.getHeaders(ctx)
			});
		} catch (error) {
			return toConvexError(error);
		}
	}
});

/**
 * Set a user's password (admin only).
 */
export const setUserPassword = mutation({
	args: {
		userId: v.string(),
		newPassword: v.string()
	},
	handler: async (ctx, args) => {
		await requireAppAdmin(ctx);
		const auth = createAuth(ctx);
		try {
			return await auth.api.setUserPassword({
				body: { userId: args.userId, newPassword: args.newPassword },
				headers: await authComponent.getHeaders(ctx)
			});
		} catch (error) {
			return toConvexError(error);
		}
	}
});

/**
 * Revoke a single user session by token (admin only).
 */
export const revokeUserSession = mutation({
	args: { sessionToken: v.string() },
	handler: async (ctx, args) => {
		await requireAppAdmin(ctx);
		const auth = createAuth(ctx);
		try {
			return await auth.api.revokeUserSession({
				body: { sessionToken: args.sessionToken },
				headers: await authComponent.getHeaders(ctx)
			});
		} catch (error) {
			return toConvexError(error);
		}
	}
});

/**
 * Revoke all of a user's sessions (admin only).
 */
export const revokeUserSessions = mutation({
	args: { userId: v.string() },
	handler: async (ctx, args) => {
		await requireAppAdmin(ctx);
		const auth = createAuth(ctx);
		try {
			return await auth.api.revokeUserSessions({
				body: { userId: args.userId },
				headers: await authComponent.getHeaders(ctx)
			});
		} catch (error) {
			return toConvexError(error);
		}
	}
});

/**
 * Force-delete an organization (admin only). Gated behind the `organizations`
 * feature toggle in addition to `admin`.
 */
export const deleteOrganizationAsAdmin = mutation({
	args: { organizationId: v.string() },
	returns: v.null(),
	handler: async (ctx, args) => {
		await requireAppAdmin(ctx);
		if (!AUTH_CONSTANTS.organizations) {
			throw new ConvexError('Organizations are not enabled');
		}
		await ctx.runMutation(components.betterAuth.adminOrganizations.adminDeleteOrganization, {
			organizationId: args.organizationId as never
		});
		return null;
	}
});
