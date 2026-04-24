'use client';

// React
import { useState } from 'react';

// Primitives
import { toast } from 'sonner';

// API
import { authClient } from '../../../lib/auth/api/auth-client';

interface EmailOtpFlowProps {
	email: string;
	emailExists: boolean;
	onSuccess: () => void;
	onBack: () => void;
	submitting: boolean;
	onSubmittingChange: (submitting: boolean) => void;
}

// Email OTP Flow Component
export const EmailOtpFlow = ({
	email,
	emailExists,
	onSuccess,
	onBack,
	submitting,
	onSubmittingChange
}: EmailOtpFlowProps) => {
	const [otp, setOtp] = useState('');
	const [name, setName] = useState('');
	const mode: 'login' | 'register' = emailExists ? 'login' : 'register';

	const handleVerifyOtp = async () => {
		onSubmittingChange(true);

		if (mode === 'login') {
			// Existing user - use regular sign in
			await authClient.signIn.emailOtp(
				{ email, otp },
				{
					onSuccess,
					onError: (ctx) => {
						console.error('OTP verification error:', ctx.error);
						toast.error(ctx.error.message || 'Invalid verification code. Please try again.');
						onSubmittingChange(false);
					}
				}
			);
		} else {
			// New user - use sign up with OTP
			try {
				await authClient.signIn.emailOtp(
					{ email, otp },
					{
						onError: (ctx) => {
							console.error('OTP verification error:', ctx.error);
							toast.error(ctx.error.message || 'Invalid verification code. Please try again.');
							onSubmittingChange(false);
						}
					}
				);

				await authClient.updateUser(
					{ name },
					{
						onSuccess,
						onError: (ctx) => {
							console.error('OTP verification error:', ctx.error);
							toast.error(ctx.error.message || 'Invalid verification code. Please try again.');
							onSubmittingChange(false);
						}
					}
				);
			} catch (error) {
				console.error('OTP sign up error:', error);
				let errorMessage = 'Invalid verification code. Please try again.';

				if (error instanceof Error) {
					if (error.message.includes('Invalid OTP')) {
						errorMessage = 'Invalid verification code. Please try again.';
					} else if (error.message.includes('expired')) {
						errorMessage = 'Verification code has expired. Please request a new one.';
					} else {
						errorMessage = error.message;
					}
				}

				toast.error(errorMessage);
				onSubmittingChange(false);
			}
		}
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		handleVerifyOtp();
	};

	return (
		<form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col gap-8">
			<div className="flex flex-col gap-5">
				<div className="flex flex-col">
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

				{mode === 'register' && (
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
							disabled={submitting}
						/>
					</div>
				)}

				<div className="flex flex-col">
					<label className="label" htmlFor="otp">
						Verification Code
					</label>
					<input
						id="otp"
						type="text"
						value={otp}
						onChange={(e) => setOtp(e.target.value)}
						className="input preset-filled-surface-200"
						placeholder="Enter verification code"
						pattern="[0-9]*"
						inputMode="numeric"
						autoComplete="one-time-code"
						maxLength={6}
						required
						disabled={submitting}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<button
					type="submit"
					className="btn preset-filled w-full"
					disabled={submitting || !otp.trim() || (mode === 'register' && !name.trim())}
				>
					{submitting ? (
						<div className="flex items-center gap-2">
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
							{mode === 'register' ? 'Creating account...' : 'Verifying...'}
						</div>
					) : mode === 'register' ? (
						'Create Account'
					) : (
						'Verify Code'
					)}
				</button>

				<button type="button" className="btn" onClick={onBack} disabled={submitting}>
					Use a different email
				</button>
			</div>
		</form>
	);
};
