'use client';

// React
import { useState } from 'react';

// Primitives
import * as Password from '@/components/primitives/ui/password';
import { toast } from 'sonner';

// API
import { authClient } from '../../../lib/auth/api/auth-client';
import { AUTH_CONSTANTS } from '@/convex/auth.constants';

interface PasswordFlowProps {
	email: string;
	emailExists: boolean;
	onSuccess: () => void;
	onBack: () => void;
	submitting: boolean;
	onSubmittingChange: (submitting: boolean) => void;
	onVerifyEmail?: () => void;
	callbackURL?: string;
}

// Password Flow Component
export const PasswordFlow = ({
	email,
	emailExists,
	onSuccess,
	onBack,
	submitting,
	onSubmittingChange,
	onVerifyEmail,
	callbackURL = '/'
}: PasswordFlowProps) => {
	const mode: 'login' | 'register' = emailExists ? 'login' : 'register';
	const [isRequestingReset, setIsRequestingReset] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onSubmittingChange(true);

		const formData = new FormData(event.currentTarget);
		const password = formData.get('password') as string;

		if (mode === 'login') {
			await authClient.signIn.email(
				{ email, password },
				{
					onSuccess,
					onError: (ctx) => {
						console.error('Sign in error:', ctx.error);
						let errorMessage = 'Could not sign in. Please check your credentials.';

						if (ctx.error.message) {
							if (ctx.error.status === 403) {
								errorMessage = 'Please verify your email address.';
							} else if (ctx.error.message.includes('Invalid password')) {
								errorMessage = 'Invalid password. Please try again.';
							} else if (ctx.error.message.includes('not found')) {
								errorMessage = 'Account not found. Please check your email or sign up.';
							} else {
								errorMessage = ctx.error.message;
							}
						}

						toast.error(errorMessage);
						onSubmittingChange(false);
					}
				}
			);
		} else {
			const name = formData.get('name') as string;

			await authClient.signUp.email(
				{ email, password, name, callbackURL },
				{
					onSuccess: () => {
						if (AUTH_CONSTANTS.sendEmails) {
							onVerifyEmail?.();
							toast.success('Verification email sent!');
							onSubmittingChange(false);
							return;
						}
						onSuccess();
					},
					onError: (ctx) => {
						console.error('Sign up error:', ctx.error);
						let errorMessage = 'Could not create account. Please try again.';

						if (ctx.error.message) {
							if (ctx.error.message.includes('already exists')) {
								errorMessage = 'An account with this email already exists.';
							} else if (ctx.error.message.includes('password')) {
								errorMessage = 'Password does not meet requirements.';
							} else {
								errorMessage = ctx.error.message;
							}
						}

						toast.error(errorMessage);
						onSubmittingChange(false);
					}
				}
			);
		}
	};

	const handleForgotPassword = async () => {
		setIsRequestingReset(true);
		try {
			const { error } = await authClient.requestPasswordReset({
				email,
				redirectTo: `${window.location.origin}/reset-password`
			});

			if (error) {
				throw new Error(error.message || 'Failed to send reset email');
			}

			toast.success('Password reset email sent!');
		} catch (error) {
			console.error('Password reset error:', error);
			toast.error(
				error instanceof Error ? error.message : 'Failed to send reset email. Please try again.'
			);
		} finally {
			setIsRequestingReset(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} noValidate autoComplete="off" className="flex flex-col gap-8">
			<div className="flex flex-col gap-5">
				<div className="flex flex-col">
					<label htmlFor="email" className="label">
						Email
					</label>
					<input
						id="email"
						type="email"
						value={email}
						disabled
						className="input preset-filled-surface-200 cursor-not-allowed opacity-60"
					/>
				</div>

				{mode === 'register' ? (
					<div className="flex flex-col">
						<label htmlFor="name" className="label">
							Full Name
						</label>
						<input
							id="name"
							name="name"
							type="text"
							className="input preset-filled-surface-200"
							placeholder="Enter your full name"
							autoComplete="name"
							required
							disabled={submitting}
						/>
					</div>
				) : null}

				<div className="flex flex-col">
					<label htmlFor="password" className="label">
						Password
					</label>
					<Password.Root minScore={mode === 'register' ? 3 : 0}>
						<Password.Input
							id="password"
							name="password"
							placeholder={mode === 'register' ? 'Create a password' : 'Enter your password'}
							autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
							required
							disabled={submitting}
						>
							<Password.ToggleVisibility />
						</Password.Input>
						{mode === 'register' ? <Password.Strength /> : null}
						<Password.Error />
					</Password.Root>
					{mode === 'login' && AUTH_CONSTANTS.sendEmails ? (
						<div className="flex flex-row items-center justify-end pt-1">
							<button
								type="button"
								className="anchor mb-1 shrink-0 text-xs"
								onClick={handleForgotPassword}
								disabled={submitting || isRequestingReset}
							>
								{isRequestingReset ? 'Sending...' : 'Forgot password?'}
							</button>
						</div>
					) : null}
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<button type="submit" className="btn preset-filled w-full" disabled={submitting}>
					{submitting ? (
						<div className="flex items-center gap-2">
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
							{mode === 'register' ? 'Creating account...' : 'Signing in...'}
						</div>
					) : mode === 'register' ? (
						'Create Account'
					) : (
						'Sign In'
					)}
				</button>

				<button type="button" className="btn" onClick={onBack} disabled={submitting}>
					Use a different email
				</button>
			</div>
		</form>
	);
};
