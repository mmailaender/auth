'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Bolt, ChevronLeft, ChevronRight, UserIcon, X } from 'lucide-react';

import * as Tabs from '@/components/primitives/ui/tabs';
import GeneralSettings from '@/components/organizations/ui/GeneralSettings';
import DeleteOrganization from '@/components/organizations/ui/DeleteOrganization';
import LeaveOrganization from '@/components/organizations/ui/LeaveOrganization';
import MembersAndInvitations from '@/components/organizations/ui/MembersAndInvitations';
import { useRoles } from '@/components/organizations/api/hooks';
import { useMobileState } from '@/components/primitives/utils/mobileState';

type OrganizationProfileProps = {
	open?: boolean;
	onSuccessfulDelete?: () => void;
};

export default function OrganizationProfile({
	open = false,
	onSuccessfulDelete
}: OrganizationProfileProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const mobileState = useMobileState();
	const isOwnerOrAdmin = useRoles().hasOwnerOrAdminRole;
	const [activeMobileTab, setActiveMobileTab] = useState('');
	const [activeDesktopTab, setActiveDesktopTab] = useState('general');
	const [initializedDesktopFromUrl, setInitializedDesktopFromUrl] = useState(false);
	const [suppressMobileTransition, setSuppressMobileTransition] = useState(false);
	const [closingFromContent, setClosingFromContent] = useState(false);

	const tabs = useMemo(
		() => [
			{ value: 'general', label: 'General', icon: Bolt, showForAllUsers: true },
			{ value: 'members', label: 'Members', icon: UserIcon, showForAllUsers: false }
		],
		[]
	);
	const visibleTabs = useMemo(
		() => tabs.filter((tab) => tab.showForAllUsers || isOwnerOrAdmin),
		[tabs, isOwnerOrAdmin]
	);

	useEffect(() => {
		if (!open) {
			setInitializedDesktopFromUrl(false);
			setActiveMobileTab('');
			setClosingFromContent(false);
		}
	}, [open]);

	useEffect(() => {
		const tabParam = searchParams.get('tab') ?? '';
		const allowed = new Set(visibleTabs.map((tab) => tab.value));
		const normalized = tabParam && allowed.has(tabParam) ? tabParam : 'general';

		if (open) {
			if (!initializedDesktopFromUrl) {
				setActiveDesktopTab(normalized);
				setInitializedDesktopFromUrl(true);
			}
			setActiveMobileTab(tabParam && allowed.has(tabParam) ? tabParam : '');
		} else if (!closingFromContent) {
			setInitializedDesktopFromUrl(false);
			setActiveMobileTab('');
		}
	}, [searchParams, visibleTabs, open, initializedDesktopFromUrl, closingFromContent]);

	useEffect(() => {
		if (!open || !mobileState.isDesktop) return;
		const params = new URLSearchParams(searchParams.toString());
		const existing = params.get('tab');
		if (existing === activeDesktopTab) return;
		params.set('dialog', 'organization-profile');
		params.set('tab', activeDesktopTab);
		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	}, [activeDesktopTab, mobileState.isDesktop, open, pathname, router, searchParams]);

	function handleMobileTabChange(value: string) {
		window.setTimeout(() => setActiveMobileTab(value), 10);
		const params = new URLSearchParams(searchParams.toString());
		params.set('dialog', 'organization-profile');
		params.set('tab', value);
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
	}

	function closeMobileTab() {
		const params = new URLSearchParams(searchParams.toString());
		params.delete('tab');
		params.set('dialog', 'organization-profile');
		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
		setActiveMobileTab('');
	}

	function closeFromContent() {
		setClosingFromContent(true);
		setSuppressMobileTransition(true);
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				const params = new URLSearchParams(searchParams.toString());
				params.delete('dialog');
				params.delete('tab');
				const query = params.toString();
				router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
				window.setTimeout(() => {
					setSuppressMobileTransition(false);
					setClosingFromContent(false);
				}, 400);
			});
		});
	}

	return (
		<Tabs.Root
			value={activeDesktopTab}
			onValueChange={setActiveDesktopTab}
			orientation="vertical"
			className="relative h-full overflow-auto"
		>
			<div className="hidden h-full w-full md:flex">
				<div className="bg-surface-50 dark:bg-surface-800 sm:bg-surface-300-700 h-full w-56 p-2">
					<div className="text-surface-600-400 p-3 pt-2 text-xs font-medium">Organization</div>
					<Tabs.List className="flex flex-col">
						{visibleTabs.map((tab) => {
							const Icon = tab.icon;
							return (
								<Tabs.Trigger key={tab.value} value={tab.value} className="gap-2 pl-2">
									<div className="flex h-6 w-6 shrink-0 items-center justify-center">
										<Icon />
									</div>
									<span className="w-full">{tab.label}</span>
								</Tabs.Trigger>
							);
						})}
					</Tabs.List>
				</div>

				<div className="flex w-full">
					<Tabs.Content value="general" className="flex h-full w-full flex-col">
						<div className="h-full">
							<h6 className="h6 pb-6 text-left">General settings</h6>
							<GeneralSettings />
						</div>
						<div>
							<LeaveOrganization />
							<DeleteOrganization onSuccessfulDelete={onSuccessfulDelete} />
						</div>
					</Tabs.Content>
					{isOwnerOrAdmin ? (
						<Tabs.Content value="members">
							<h6 className="h6 pb-6 text-left">Members</h6>
							<MembersAndInvitations />
						</Tabs.Content>
					) : null}
				</div>
			</div>

			<div className="relative h-full w-full overflow-hidden md:hidden">
				<div
					className={[
						'flex h-full',
						closingFromContent ? 'w-full transform-none' : 'w-[200%] transform',
						!suppressMobileTransition && !closingFromContent
							? 'transition-transform duration-300 ease-out'
							: '',
						!closingFromContent && activeMobileTab !== ''
							? '-translate-x-1/2'
							: !closingFromContent
								? 'translate-x-0'
								: ''
					].join(' ')}
				>
					<div
						className={[
							'bg-surface-100 dark:bg-surface-900 sm:bg-surface-300-700 relative h-full w-1/2 p-2',
							closingFromContent ? 'hidden' : ''
						].join(' ')}
					>
						<div className="h5 px-3 pt-3 pb-8">Organization settings</div>
						<button
							className="ring-offset-background focus:ring-ring hover:bg-surface-300-700 rounded-base absolute top-5 right-4 z-10 p-2 opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4"
							onClick={closeFromContent}
							aria-label="Close organization profile"
							type="button"
						>
							<X />
						</button>
						<Tabs.List className="flex w-full flex-col pr-2">
							{visibleTabs.map((tab, index) => {
								const Icon = tab.icon;
								return (
									<div key={tab.value}>
										<Tabs.Trigger
											value={tab.value}
											onClick={() => handleMobileTabChange(tab.value)}
											className="flex w-full items-center justify-between gap-3 aria-selected:bg-transparent aria-selected:text-inherit data-[selected]:bg-transparent data-[selected]:text-inherit"
										>
											<div className="bg-surface-300-700 rounded-base flex size-8 shrink-0 items-center justify-center">
												<Icon />
											</div>
											<span className="w-full">{tab.label}</span>
											<ChevronRight className="text-surface-500 flex" />
										</Tabs.Trigger>
										{index < visibleTabs.length - 1 ? (
											<div className="flex h-2 w-full items-center justify-center px-3">
												<hr className="border-surface-200-800 w-full border" />
											</div>
										) : null}
									</div>
								);
							})}
						</Tabs.List>
					</div>

					<div
						className={[
							'bg-surface-50 dark:bg-surface-900 flex h-full flex-col gap-4 px-4 py-6',
							closingFromContent ? 'absolute inset-0 w-full' : 'relative w-1/2'
						].join(' ')}
					>
						<button
							className="ring-offset-background focus:ring-ring hover:bg-surface-300-700 rounded-base absolute top-5 left-4 z-10 p-2 opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4"
							onClick={closeMobileTab}
							aria-label="Go back to organization settings menu"
						>
							<ChevronLeft />
						</button>

						{activeMobileTab === 'general' ? (
							<>
								<div className="h-full">
									<h6 className="h6 pb-12 pl-10">General settings</h6>
									<GeneralSettings />
								</div>
								<DeleteOrganization onSuccessfulDelete={onSuccessfulDelete} />
								<LeaveOrganization />
							</>
						) : null}
						{activeMobileTab === 'members' ? (
							<>
								<h6 className="h6 pb-6 pl-10">Members</h6>
								<MembersAndInvitations />
							</>
						) : null}
					</div>
				</div>
			</div>
		</Tabs.Root>
	);
}
