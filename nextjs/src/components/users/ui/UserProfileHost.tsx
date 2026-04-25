'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useConvexAuth } from 'convex/react';

import * as Dialog from '@/components/primitives/ui/dialog';
import UserProfile from '@/components/users/ui/UserProfile';
import { DIALOG_KEY } from '@/components/users/utils/user.constants';
import {
	isEditableElement,
	scheduleScrollIntoView
} from '@/components/primitives/utils/focusScroll';

export default function UserProfileHost() {
	const { isAuthenticated } = useConvexAuth();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const shouldBeOpen = searchParams.get('dialog') === DIALOG_KEY;
	const [open, setOpen] = useState(false);
	const [suppressTransition, setSuppressTransition] = useState(false);
	const [suppressDialogRender, setSuppressDialogRender] = useState(false);
	const [isIOS, setIsIOS] = useState(false);

	useEffect(() => {
		const ua = navigator.userAgent;
		setIsIOS(
			/iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
		);
	}, []);

	useEffect(() => {
		setOpen(shouldBeOpen);
	}, [shouldBeOpen]);

	useEffect(() => {
		const handleClose = () => closeProfileModal();
		window.addEventListener('user-profile:close', handleClose);
		return () => window.removeEventListener('user-profile:close', handleClose);
	});

	function closeProfileModal() {
		const params = new URLSearchParams(searchParams.toString());
		if (params.get('dialog') === DIALOG_KEY) {
			params.delete('dialog');
			const query = params.toString();
			router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
		}
		setOpen(false);
	}

	useEffect(() => {
		if (!isIOS) return;
		const onPopState = () => {
			setSuppressTransition(true);
			setSuppressDialogRender(true);
			window.setTimeout(() => {
				setSuppressTransition(false);
				setSuppressDialogRender(false);
			}, 450);
		};
		window.addEventListener('popstate', onPopState);
		return () => window.removeEventListener('popstate', onPopState);
	}, [isIOS]);

	if (!isAuthenticated || suppressDialogRender) return null;

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) closeProfileModal();
				else setOpen(true);
			}}
		>
			<Dialog.Content
				className={`md:rounded-container top-0 left-0 flex h-full max-h-[100dvh] w-full max-w-full translate-x-0 translate-y-0 flex-col items-start rounded-none md:top-[50%] md:left-[50%] md:h-auto md:max-h-[90vh] md:w-auto md:translate-x-[-50%] md:translate-y-[-50%] ${suppressTransition ? 'animate-none transition-none duration-0 data-[state=closed]:duration-0 data-[state=open]:duration-0' : ''}`}
			>
				<Dialog.Header>
					<Dialog.Title>Profile</Dialog.Title>
				</Dialog.Header>
				<div
					className="max-h-[100dvh] w-full overflow-auto overscroll-contain p-6 md:w-[560px]"
					onFocus={(event) => {
						const el = event.target as HTMLElement | null;
						if (el && isEditableElement(el)) scheduleScrollIntoView(el);
					}}
				>
					<UserProfile />
				</div>
				<Dialog.CloseX />
			</Dialog.Content>
		</Dialog.Root>
	);
}
