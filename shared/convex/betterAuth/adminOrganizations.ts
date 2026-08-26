/**
 * Component-side organization functions used exclusively by the application
 * admin dashboard. These live in their own file (rather than `organization.ts`)
 * so the `admin/convex` registry item can be installed independently of the
 * `organizations` capability — the `organization`/`member`/`invitation` tables
 * always exist in the Better Auth schema, even when the organization plugin is
 * disabled (they are simply empty).
 *
 * Authorization is enforced by the public `admin/*` wrappers via
 * `requireAppAdmin` before any of these functions are reached.
 */
import { v } from 'convex/values';
import { paginationOptsValidator } from 'convex/server';
import { mutation, query } from './_generated/server';
import { withSystemFields } from 'convex-helpers/validators';
import schema from './schema';
import { type Id } from './_generated/dataModel';

/**
 * List every organization in the deployment, newest first. Unlike
 * `organizations/queries.listOrganizations` (scoped to the caller's
 * memberships), this returns all organizations for the admin dashboard.
 */
export const listAllOrganizations = query({
	args: { paginationOpts: paginationOptsValidator },
	returns: v.object({
		page: v.array(
			v.object(withSystemFields('organization', schema.tables.organization.validator.fields))
		),
		isDone: v.boolean(),
		continueCursor: v.string(),
		splitCursor: v.optional(v.union(v.string(), v.null())),
		pageStatus: v.optional(
			v.union(v.literal('SplitRecommended'), v.literal('SplitRequired'), v.null())
		)
	}),
	handler: async (ctx, args) => {
		return await ctx.db.query('organization').order('desc').paginate(args.paginationOpts);
	}
});

/**
 * Return a single organization together with its members (each joined to a
 * lightweight user summary). Used by the admin organization detail view.
 */
export const getOrganizationWithMembers = query({
	args: { organizationId: v.id('organization') },
	returns: v.union(
		v.null(),
		v.object({
			organization: v.object(
				withSystemFields('organization', schema.tables.organization.validator.fields)
			),
			members: v.array(
				v.object({
					_id: v.id('member'),
					role: v.string(),
					createdAt: v.number(),
					user: v.union(
						v.null(),
						v.object({
							_id: v.id('user'),
							name: v.string(),
							email: v.string(),
							image: v.union(v.null(), v.string())
						})
					)
				})
			)
		})
	),
	handler: async (ctx, args) => {
		const organization = await ctx.db.get('organization', args.organizationId);
		if (!organization) {
			return null;
		}

		const members = await ctx.db
			.query('member')
			.withIndex('organizationId', (q) => q.eq('organizationId', args.organizationId))
			.take(200);

		const membersWithUsers = await Promise.all(
			members.map(async (member) => {
				const user = await ctx.db.get('user', member.userId as Id<'user'>);
				return {
					_id: member._id,
					role: member.role,
					createdAt: member.createdAt,
					user: user
						? {
								_id: user._id,
								name: user.name,
								email: user.email,
								image: user.image ?? null
							}
						: null
				};
			})
		);

		return { organization, members: membersWithUsers };
	}
});

/**
 * Force-delete an organization and all of its dependent records (members,
 * invitations, stored logo) regardless of the caller's membership.
 */
export const adminDeleteOrganization = mutation({
	args: { organizationId: v.id('organization') },
	returns: v.null(),
	handler: async (ctx, args) => {
		const organization = await ctx.db.get('organization', args.organizationId);
		if (!organization) {
			return null;
		}

		// Remove memberships.
		const members = ctx.db
			.query('member')
			.withIndex('organizationId', (q) => q.eq('organizationId', args.organizationId));
		for await (const member of members) {
			await ctx.db.delete('member', member._id);
		}

		// Remove pending invitations.
		const invitations = ctx.db
			.query('invitation')
			.withIndex('organizationId', (q) => q.eq('organizationId', args.organizationId));
		for await (const invitation of invitations) {
			await ctx.db.delete('invitation', invitation._id);
		}

		// Remove the stored logo, if any.
		if (organization.logoId) {
			await ctx.storage.delete(organization.logoId);
		}

		await ctx.db.delete('organization', args.organizationId);
		return null;
	}
});
