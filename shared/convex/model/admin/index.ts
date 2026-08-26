import { ConvexError } from 'convex/values';
import { authComponent } from '../../auth';

// Types
import type { MutationCtx, QueryCtx } from '../../_generated/server';

/**
 * Roles that are treated as application-level ("site") admins.
 *
 * This must stay in sync with the `adminRoles` option passed to the Better Auth
 * `admin()` plugin in `auth.ts` (the plugin defaults to `['admin']`). It is
 * deliberately separate from the per-organization `owner` / `admin` / `member`
 * roles managed by the `organization` plugin.
 */
const APP_ADMIN_ROLES = ['admin'];

const getAdminUserIds = (): string[] =>
	(process.env.ADMIN_USER_IDS ?? '')
		.split(',')
		.map((id) => id.trim())
		.filter(Boolean);

/**
 * Returns `true` when the given Better Auth user is an application-level admin,
 * either because they hold an admin role or because their id is listed in the
 * `ADMIN_USER_IDS` bootstrap env var.
 *
 * Better Auth stores the `role` field as a (potentially comma-separated) string.
 */
export const isAppAdminUser = (user: { _id: string; role?: string | null } | null): boolean => {
	if (!user) return false;
	if (getAdminUserIds().includes(user._id)) return true;
	const roles = (user.role ?? '')
		.split(',')
		.map((role) => role.trim())
		.filter(Boolean);
	return roles.some((role) => APP_ADMIN_ROLES.includes(role));
};

/**
 * Resolve the current user and return whether they are an app admin. Safe to use
 * from UI-facing queries (does not throw for anonymous users).
 */
export const getIsAppAdmin = async (ctx: QueryCtx | MutationCtx): Promise<boolean> => {
	const user = await authComponent.safeGetAuthUser(ctx);
	return isAppAdminUser(user as { _id: string; role?: string | null } | null);
};

/**
 * Defense-in-depth guard used by **every** admin Convex function. UI gating only
 * hides the surface; this is the real authorization boundary. Throws if the
 * caller is not an application admin.
 *
 * @returns The authenticated admin user document.
 */
export const requireAppAdmin = async (ctx: QueryCtx | MutationCtx) => {
	const user = await authComponent.safeGetAuthUser(ctx);
	if (!user) {
		throw new ConvexError('Not authenticated');
	}
	if (!isAppAdminUser(user as { _id: string; role?: string | null })) {
		throw new ConvexError('Forbidden: application admin role required');
	}
	return user;
};

/**
 * Guard against an admin performing a destructive action on their own account
 * (e.g. self-ban, self-delete, self-demotion), which would risk locking
 * themselves out.
 */
export const assertNotSelf = (adminUserId: string, targetUserId: string, action: string): void => {
	if (adminUserId === targetUserId) {
		throw new ConvexError(`You cannot ${action} your own account.`);
	}
};
