'use client';

import { useEffect, useState } from 'react';

import { authClient } from '@/lib/auth/api/auth-client';
import { AUTH_CONSTANTS } from '@/convex/auth.constants';

type ActionState = 'approve' | 'deny' | null;

export default function DeviceAuthorization({ code }: { code: string }) {
	const [verifyLoading, setVerifyLoading] = useState(true);
	const [verifyError, setVerifyError] = useState<string | null>(null);
	const [verified, setVerified] = useState(false);
	const [actionLoading, setActionLoading] = useState<ActionState>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const [actionDone, setActionDone] = useState<'approved' | 'denied' | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function verify() {
			if (!AUTH_CONSTANTS.deviceAuthorization) {
				setVerifyLoading(false);
				return;
			}

			if (!code) {
				setVerifyError('Missing code');
				setVerifyLoading(false);
				return;
			}

			setVerifyLoading(true);
			const response = await authClient.device({
				query: { user_code: code }
			});
			if (cancelled) return;

			if (response.error) {
				setVerifyError(response.error.error_description);
			} else {
				setVerified(true);
			}
			setVerifyLoading(false);
		}

		void verify();

		return () => {
			cancelled = true;
		};
	}, [code]);

	async function handleApprove() {
		setActionError(null);
		setActionLoading('approve');
		const { error } = await authClient.device.approve({ userCode: code });
		if (error) {
			setActionError(error.error_description);
			setActionLoading(null);
			return;
		}
		setActionDone('approved');
		setActionLoading(null);
	}

	async function handleDeny() {
		setActionError(null);
		setActionLoading('deny');
		const { error } = await authClient.device.deny({ userCode: code });
		if (error) {
			setActionError(error.error_description);
			setActionLoading(null);
			return;
		}
		setActionDone('denied');
		setActionLoading(null);
	}

	return (
		<section className="mx-auto max-w-lg p-6">
			<h1 className="mb-4 text-2xl font-semibold">Authorize Device</h1>
			{!AUTH_CONSTANTS.deviceAuthorization ? (
				<p className="opacity-80">Device authorization is not enabled.</p>
			) : verifyLoading ? (
				<p className="opacity-80">Verifying your code…</p>
			) : verifyError ? (
				<>
					<div className="rounded-container bg-error-50-950 text-error-contrast-50-950 mb-4 p-3">
						<p>{verifyError}</p>
					</div>
					<p className="text-sm opacity-80">
						Check that you opened this page from the device and that the URL contains a valid code.
					</p>
				</>
			) : actionDone === 'approved' ? (
				<>
					<div className="rounded-container text-success-contrast-50-950 bg-success-50-950 mb-4 p-3">
						<p>Success! You approved the request.</p>
					</div>
					<p className="opacity-80">
						You can return to the device now. The device should connect automatically.
					</p>
				</>
			) : actionDone === 'denied' ? (
				<>
					<div className="rounded-container text-warning-contrast-50-950 bg-warning-50-950 mb-4 p-3">
						<p>Request denied.</p>
					</div>
					<p className="opacity-80">You can close this window.</p>
				</>
			) : verified ? (
				<>
					<p className="mb-6 opacity-80">Do you want to sign in on your device?</p>
					{actionError ? (
						<div className="rounded-container bg-error-50-950 text-error-contrast-50-950 mb-4 p-3">
							<p>{actionError}</p>
						</div>
					) : null}
					<div className="flex justify-end gap-3">
						<button
							className="btn preset-filled-surface-500"
							onClick={handleDeny}
							disabled={!!actionLoading}
						>
							{actionLoading === 'deny' ? 'Denying…' : 'Deny'}
						</button>
						<button
							className="btn preset-filled-primary-500"
							onClick={handleApprove}
							disabled={!!actionLoading}
						>
							{actionLoading === 'approve' ? 'Approving…' : 'Approve'}
						</button>
					</div>
				</>
			) : null}
		</section>
	);
}
