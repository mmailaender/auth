'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { authClient } from '@/lib/auth/api/auth-client';
import { useActiveUserData } from '@/lib/auth/hooks';

export default function Emails() {
	const activeUser = useActiveUserData();
	const searchParams = useSearchParams();
	const [isEditingEmail, setIsEditingEmail] = useState(false);
	const [newEmail, setNewEmail] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const inputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (activeUser && !isEditingEmail) {
			setNewEmail(activeUser.email);
		}
	}, [activeUser, isEditingEmail]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!activeUser) return;

		if (!newEmail.trim()) {
			toast.error('Please enter a valid email address');
			return;
		}
		if (newEmail === activeUser.email) {
			toast.error('New email must be different from current email');
			return;
		}

		try {
			setIsSubmitting(true);
			const currentUrl = new URL(window.location.href);
			if (searchParams.get('dialog') !== 'user-profile') {
				currentUrl.searchParams.set('dialog', 'user-profile');
			}
			await authClient.changeEmail({
				newEmail,
				callbackURL: currentUrl.toString()
			});
			setIsEditingEmail(false);
			toast.success('Verification email sent to your new email address');
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred';
			toast.error(`Failed to change email: ${errorMsg}`);
		} finally {
			setIsSubmitting(false);
		}
	}

	if (!activeUser) {
		return <div className="placeholder h-16 w-full animate-pulse" />;
	}

	return (
		<div className="flex flex-col gap-6">
			<div
				className={[
					'border-surface-300-700 rounded-container relative w-full border px-3.5 py-2 transition-all duration-200 ease-in-out',
					!isEditingEmail
						? 'hover:bg-surface-200-800 hover:border-surface-200-800 cursor-pointer'
						: ''
				].join(' ')}
			>
				<div className="flex items-center justify-between gap-3 transition-all duration-200 ease-in-out">
					<div className="flex w-full flex-col">
						<span className="text-surface-600-400 text-xs">Email Address</span>
						<div
							className={[
								'grid transition-[grid-template-rows] duration-200 ease-in-out',
								isEditingEmail ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
								!isEditingEmail ? 'mt-1' : ''
							].join(' ')}
							aria-hidden={isEditingEmail}
							inert={isEditingEmail}
						>
							<div className="overflow-hidden">
								<div className="flex items-center gap-2">
									<span className="truncate text-sm">{activeUser.email}</span>
									{activeUser.emailVerified ? (
										<span className="badge preset-filled-success-100-900 text-xs">Verified</span>
									) : (
										<span className="badge preset-filled-warning-100-900 text-xs">
											Not verified
										</span>
									)}
								</div>
							</div>
						</div>

						<div
							className={[
								'grid transition-[grid-template-rows] duration-200 ease-in-out',
								isEditingEmail ? 'mt-1 grid-rows-[1fr]' : 'grid-rows-[0fr]'
							].join(' ')}
							aria-hidden={!isEditingEmail}
							inert={!isEditingEmail}
						>
							<div className="overflow-hidden">
								<form onSubmit={handleSubmit} className="flex flex-col gap-3">
									<input
										ref={inputRef}
										type="email"
										className="input w-full"
										value={newEmail}
										onChange={(event) => setNewEmail(event.currentTarget.value)}
										placeholder="Enter new email address"
										required
										disabled={isSubmitting}
									/>
									<div className="mb-1 flex gap-1.5">
										<button
											type="button"
											className="btn btn-sm preset-tonal w-full"
											onClick={() => {
												setNewEmail(activeUser.email);
												setIsEditingEmail(false);
											}}
											disabled={isSubmitting}
										>
											Cancel
										</button>
										<button
											type="submit"
											className="btn btn-sm preset-filled-primary-500 w-full"
											disabled={
												isSubmitting ||
												!newEmail ||
												newEmail.trim() === '' ||
												newEmail === activeUser.email
											}
										>
											{isSubmitting ? 'Verifying...' : 'Verify Email'}
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
					{!isEditingEmail ? (
						<>
							<div className="shrink-0">
								<span className="btn-icon preset-filled-surface-50-950 pointer-events-none p-2">
									<Pencil className="size-4" />
								</span>
							</div>
							<button
								className="absolute inset-0 h-full w-full"
								aria-label="Change email"
								type="button"
								onClick={() => {
									setIsEditingEmail(true);
									setNewEmail(activeUser.email);
									requestAnimationFrame(() => {
										inputRef.current?.focus();
										inputRef.current?.select();
									});
								}}
							/>
						</>
					) : null}
				</div>
			</div>
		</div>
	);
}
