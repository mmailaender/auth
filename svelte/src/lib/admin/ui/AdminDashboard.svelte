<script lang="ts">
	// SvelteKit
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	// Primitives
	import * as Tabs from '$lib/primitives/ui/tabs';
	// Icons
	import UsersIcon from '@lucide/svelte/icons/users';
	import BuildingIcon from '@lucide/svelte/icons/building-2';
	// Components
	import UsersTable from '$lib/admin/ui/UsersTable.svelte';
	import OrganizationsTable from '$lib/admin/ui/OrganizationsTable.svelte';
	// Constants & API
	import { getAuthContext } from '$lib/auth/context.svelte';
	import { TAB_ORGANIZATIONS, TAB_USERS } from '$lib/admin/utils/admin.constants';

	const { authConstants } = getAuthContext();
	const organizationsEnabled = Boolean(authConstants.organizations);

	// Tab state lives in `?adminTab=` so the active tab survives reloads and can
	// be deep-linked.
	const activeTab = $derived(
		page.url.searchParams.get('adminTab') === TAB_ORGANIZATIONS && organizationsEnabled
			? TAB_ORGANIZATIONS
			: TAB_USERS
	);

	function setActiveTab(tab: string | null) {
		if (!tab) return;
		const url = new URL(page.url);
		url.searchParams.set('adminTab', tab);
		void goto(resolve(`${url.pathname}${url.search}${url.hash}` as Pathname), {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}
</script>

<Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value)}>
	<Tabs.List class="flex gap-2">
		<Tabs.Trigger value={TAB_USERS} class="flex items-center gap-2">
			<UsersIcon class="size-4" />
			<span>Users</span>
		</Tabs.Trigger>
		{#if organizationsEnabled}
			<Tabs.Trigger value={TAB_ORGANIZATIONS} class="flex items-center gap-2">
				<BuildingIcon class="size-4" />
				<span>Organizations</span>
			</Tabs.Trigger>
		{/if}
	</Tabs.List>

	<Tabs.Content value={TAB_USERS}>
		<UsersTable />
	</Tabs.Content>

	{#if organizationsEnabled}
		<Tabs.Content value={TAB_ORGANIZATIONS}>
			<OrganizationsTable />
		</Tabs.Content>
	{/if}
</Tabs.Root>
