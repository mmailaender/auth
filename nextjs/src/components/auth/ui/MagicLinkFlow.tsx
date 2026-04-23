'use client';

// React
import { useState } from 'react';

// Primitives
import { toast } from 'sonner';

// API
import { authClient } from '../../../lib/auth/api/auth-client';

interface MagicLinkFlowProps {
	email: string;
	onBack: () => void;
	submitting: boolean;
	onSubmittingChange: (submitting: boolean) => void;
	callbackURL?: string;
	onLinkSent?: () => void;
}

// Magic Link Flow Component (new user registration only)
export const MagicLinkFlow = ({
	email,
	onBack,
	submitting,
	onSubmittingChange,
	callbackURL = '/',
	onLinkSent
}: MagicLinkFlowProps) => {
	const [name, setName] = useState('');
	const [linkSent, setLinkSent] = useState(false);

	const handleSendMagicLink = async () => {
		onSubmittingChange(true);

		try {
			await authClient.signIn.magicLink(
				{
					email,
					name,
					callbackURL,
					newUserCallbackURL: callbackURL,
					errorCallbackURL: '/signin?error=magic-link-failed'
				},
				{
					onSuccess: () => {
						setLinkSent(true);
						onSubmittingChange(false);
						toast.success('Magic link sent to your email!');
						onLinkSent?.();
					},
					onError: (ctx) => {
						console.error('Magic link send error:', ctx.error);
						toast.error(ctx.error.message || 'Failed to send magic link. Please try again.');
						onSubmittingChange(false);
					}
				}
			);
		} catch (error) {
			console.error('Magic link error:', error);
			toast.error('Failed to send magic link. Please try again.');
			onSubmittingChange(false);
		}
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (!linkSent) {
			handleSendMagicLink();
		}
	};

	return (
		<form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				<label className="label" htmlFor="email">
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

			<div className="flex flex-col">
				<label className="label" htmlFor="name">
					Full Name
				</label>
				<input
					id="name"
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="input preset-filled-surface-200"
					placeholder="Enter your full name"
					autoComplete="name"
					required
					disabled={submitting || linkSent}
				/>
			</div>

			<button
				type="submit"
				className="btn preset-filled w-full"
				disabled={submitting || !name.trim()}
			>
				{submitting ? (
					<div className="flex items-center gap-2">
						<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
						Sending...
					</div>
				) : (
					'Send Magic Link'
				)}
			</button>

			<button type="button" className="btn" onClick={onBack} disabled={submitting}>
				Use a different email
			</button>
		</form>
	);
};
