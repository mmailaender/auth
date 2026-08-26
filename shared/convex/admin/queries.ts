import { query } from '../_generated/server';
import { ConvexError, v } from 'convex/values';
import { paginationOptsValidator } from 'convex/server';
import { APIError } from 'better-auth/api';

import { authComponent, createAuth } from '../auth';
import { components } from '../_generated/api';
import { AUTH_CONSTANTS } from '../auth.constants';
import { getIsAppAdmin, requireAppAdmin } from '../model/admin';

/**
 * Whether the currently authenticated user is an application ("site") admin.
 *
 * Drives UI gating only — every privileged admin function additionally enforces
 * `requireAppAdmin` on the server.
 */
export const isCurrentUserAdmin = query({
	args: {},
	returns: v.boolean(),
	handler: async (ctx) => {
		if (!AUTH_CONSTANTS.admin) return false;
		return getIsAppAdmin(ctx);
	}
});

/**
 * Impersonation state of the current session. Non-null while the caller is
 * being impersonated by an admin (`session.impersonatedBy` is set).
 *
 * Deliberately NOT admin-gated: the impersonated session belongs to a regular
 * user, and the "you are impersonating" banner it drives must render for them.
 * It only ever exposes the caller's own session state.
 */
export const getImpersonationStatus = query({
	args: {},
	returns: v.union(v.null(), v.object({ impersonatedBy: v.string() })),
	handler: async (ctx) => {
		if (!AUTH_CONSTANTS.admin) return null;
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user) return null;
		const auth = createAuth(ctx);
		const session = await auth.api.getSession({
			headers: await authComponent.getHeaders(ctx)
		});
		const impersonatedBy = (session?.session as { impersonatedBy?: string | null } | undefined)
			?.impersonatedBy;
		return impersonatedBy ? { impersonatedBy } : null;
	}
});

/**
 * List all users in the deployment (admin only). Wraps the Better Auth admin
 * `listUsers` endpoint; supports search and offset/limit paging.
 */
export const listUsers = query({
	args: {
		searchValue: v.optional(v.string()),
		limit: v.optional(v.number()),
		offset: v.optional(v.number()),
		sortBy: v.optional(v.string()),
		sortDirection: v.optional(v.union(v.literal('asc'), v.literal('desc')))
	},
	handler: async (ctx, args) => {
		await requireAppAdmin(ctx);
		const auth = createAuth(ctx);
		try {
			return await auth.api.listUsers({
				query: {
					searchValue: args.searchValue || undefined,
					searchField: args.searchValue ? 'name' : undefined,
					searchOperator: args.searchValue ? 'contains' : undefined,
					limit: args.limit ?? 50,
					offset: args.offset ?? 0,
					sortBy: args.sortBy ?? 'createdAt',
					sortDirection: args.sortDirection ?? 'desc'
				},
				headers: await authComponent.getHeaders(ctx)
			});
		} catch (error) {
			if (error instanceof APIError) {
				throw new ConvexError(`${error.statusCode} ${error.status} ${error.message}`);
			}
			throw error;
		}
	}
});

/**
 * List the active sessions for a given user (admin only).
 */
export const listUserSessions = query({
	args: { userId: v.string() },
	handler: async (ctx, args) => {
		await requireAppAdmin(ctx);
		const auth = createAuth(ctx);
		try {
			return await auth.api.listUserSessions({
				body: { userId: args.userId },
				headers: await authComponent.getHeaders(ctx)
			});
		} catch (error) {
			if (error instanceof APIError) {
				throw new ConvexError(`${error.statusCode} ${error.status} ${error.message}`);
			}
			throw error;
		}
	}
});

/**
 * List every organization in the deployment (admin only).
 *
 * Gated behind both the `admin` and `organizations` feature toggles. Returns an
 * empty page when organizations are disabled so callers can render safely.
 */
export const listAllOrganizations = query({
	args: { paginationOpts: paginationOptsValidator },
	handler: async (ctx, args) => {
		await requireAppAdmin(ctx);
		if (!AUTH_CONSTANTS.organizations) {
			return { page: [], isDone: true, continueCursor: '' };
		}
		return await ctx.runQuery(components.betterAuth.adminOrganizations.listAllOrganizations, {
			paginationOpts: args.paginationOpts
		});
	}
});

/**
 * Fetch a single organization with its members (admin only).
 */
export const getOrganizationWithMembers = query({
	args: { organizationId: v.string() },
	handler: async (ctx, args) => {
		await requireAppAdmin(ctx);
		if (!AUTH_CONSTANTS.organizations) {
			return null;
		}
		return await ctx.runQuery(components.betterAuth.adminOrganizations.getOrganizationWithMembers, {
			organizationId: args.organizationId as never
		});
	}
});
