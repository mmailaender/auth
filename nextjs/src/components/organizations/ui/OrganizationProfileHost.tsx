'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useConvexAuth } from 'convex/react';

import * as Dialog from '@/components/primitives/ui/dialog';
import OrganizationProfile from '@/components/organizations/ui/OrganizationProfile';
import { DIALOG_KEY } from '@/components/organizations/utils/organization.constants';
import {
	isEditableElement,
	scheduleScrollIntoView
} from '@/components/primitives/utils/focusScroll';

export default function OrganizationProfileHost() {
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

	useEffect(() => setOpen(isAuthenticated && shouldBeOpen), [isAuthenticated, shouldBeOpen]);

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

	function closeProfileModal() {
		const params = new URLSearchParams(searchParams.toString());
		if (params.get('dialog') === DIALOG_KEY) {
			params.delete('dialog');
			params.delete('tab');
			const query = params.toString();
			router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
		}
		setOpen(false);
	}

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
				className={`md:rounded-container top-0 left-0 h-full max-h-[100dvh] w-full max-w-full translate-x-0 translate-y-0 rounded-none p-0 md:top-1/2 md:left-1/2 md:h-[70vh] md:w-2xl md:-translate-x-1/2 md:-translate-y-1/2 lg:w-4xl ${suppressTransition ? 'animate-none transition-none duration-0 data-[state=closed]:duration-0 data-[state=open]:duration-0' : ''}`}
			>
				<div
					className="h-full w-full overflow-auto overscroll-contain"
					onFocus={(event) => {
						const el = event.target as HTMLElement | null;
						if (!el || isIOS || !isEditableElement(el)) return;
						scheduleScrollIntoView(el);
					}}
				>
					<OrganizationProfile open={open} onSuccessfulDelete={() => setOpen(false)} />
				</div>
				<Dialog.CloseX />
			</Dialog.Content>
		</Dialog.Root>
	);
}
