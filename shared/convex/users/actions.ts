import { v } from 'convex/values';
import { action } from '../_generated/server';
import validateEmail from '../model/emails/validateEmail.js';
import { AUTH_CONSTANTS } from '../auth.constants';
import { components } from '../_generated/api';

/**
 * Validates the email address and returns whether the auth flow should
 * continue with sign-in or sign-up.
 */
export const checkEmailAvailabilityAndValidity = action({
	args: {
		email: v.string()
	},
	handler: async (ctx, args) => {
		const { email } = args;
		const user = await ctx.runQuery(components.betterAuth.user.getUserByEmail, { email });
		const exists = user !== null;

		if (exists) {
			return {
				valid: true,
				exists: true,
				email,
				reason: 'User with this email already exists'
			};
		}

		if (AUTH_CONSTANTS.validateEmails) {
			const result = await validateEmail(ctx, email);
			return {
				...result,
				exists: false
			};
		}

		return {
			valid: true,
			exists: false,
			email,
			reason: 'Email verification disabled'
		};
	}
});
