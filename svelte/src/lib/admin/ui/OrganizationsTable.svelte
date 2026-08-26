<script lang="ts">
	// Primitives
	import * as Avatar from '$lib/primitives/ui/avatar';
	import * as Dialog from '$lib/primitives/ui/dialog';
	// Icons
	import TrashIcon from '@lucide/svelte/icons/trash';
	import UsersIcon from '@lucide/svelte/icons/users';
	// API
	import { useQuery, useConvexClient, usePaginatedQuery } from 'convex-svelte';
	import { getAuthContext } from '$lib/auth/context.svelte';
	import { toast } from 'svelte-sonner';

	type OrgRow = {
		_id: string;
		name: string;
		slug: string;
		logo?: string | null;
	};

	const { api } = getAuthContext();
	const client = useConvexClient();

	const orgsQuery = usePaginatedQuery(
		api.admin.queries.listAllOrganizations,
		() => ({}),
		() => ({ initialNumItems: 25 })
	);
	const organizations = $derived((orgsQuery.results ?? []) as OrgRow[]);

	let selectedOrg = $state<OrgRow | null>(null);
	let membersOpen = $state(false);
	let deleteOpen = $state(false);

	const orgDetailResponse = useQuery(api.admin.queries.getOrganizationWithMembers, () =>
		membersOpen && selectedOrg ? { organizationId: selectedOrg._id } : 'skip'
	);
	const orgDetail = $derived(orgDetailResponse?.data);

	async function handleDelete() {
		if (!selectedOrg) return;
		try {
			await client.mutation(api.admin.mutations.deleteOrganizationAsAdmin, {
				organizationId: selectedOrg._id
			});
			toast.success('Organization deleted');
			deleteOpen = false;
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to delete organization');
		}
	}
</script>

<div class="flex h-full flex-col py-4">
	{#if orgsQuery.status === 'LoadingFirstPage'}
		<div class="p-4 text-sm opacity-60">Loading organizations...</div>
	{:else if organizations.length === 0}
		<div class="p-4 text-sm opacity-60">No organizations found.</div>
	{:else}
		<div class="max-h-[calc(80vh-12rem)] overflow-y-auto pb-12">
			<table class="table w-full">
				<thead class="sticky top-0 z-20">
					<tr>
						<th class="text-surface-600-400 p-2 !pl-3 text-left text-xs font-semibold">Name</th>
						<th class="text-surface-600-400 hidden p-2 text-left text-xs sm:table-cell">Slug</th>
						<th class="!w-24 p-2 text-right"></th>
					</tr>
				</thead>
				<tbody>
					{#each organizations as org (org._id)}
						<tr class="!border-surface-300-700 !border-t">
							<td class="!py-3 !pl-3">
								<div class="flex items-center space-x-2">
									<Avatar.Root class="size-8 sm:size-6">
										<Avatar.Image src={org.logo ?? undefined} alt={org.name} />
										<Avatar.Fallback>
											<Avatar.Marble name={org.name} />
										</Avatar.Fallback>
									</Avatar.Root>
									<span class="truncate text-sm">{org.name}</span>
								</div>
							</td>
							<td class="!text-surface-600-400 hidden !truncate text-sm sm:table-cell"
								>{org.slug}</td
							>
							<td class="!w-24">
								<div class="flex justify-end gap-1">
									<button
										type="button"
										title="View members"
										class="btn-icon preset-filled-surface-200-800"
										onclick={() => {
											selectedOrg = org;
											membersOpen = true;
										}}
									>
										<UsersIcon class="size-4 opacity-70" />
									</button>
									<button
										type="button"
										title="Delete organization"
										class="btn-icon preset-filled-surface-200-800 hover:preset-filled-error-300-700"
										onclick={() => {
											selectedOrg = org;
											deleteOpen = true;
										}}
									>
										<TrashIcon class="size-4 opacity-70" />
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			{#if orgsQuery.status === 'CanLoadMore'}
				<div class="flex justify-center py-3">
					<button type="button" class="btn preset-tonal" onclick={() => orgsQuery.loadMore(25)}>
						Load more
					</button>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Members dialog -->
	<Dialog.Root bind:open={membersOpen}>
		<Dialog.Content class="md:max-w-108">
			<Dialog.Header>
				<Dialog.Title>{selectedOrg?.name} members</Dialog.Title>
			</Dialog.Header>
			<div class="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
				{#if !orgDetail}
					<div class="text-sm opacity-60">Loading members...</div>
				{:else if orgDetail.members.length === 0}
					<div class="text-sm opacity-60">No members.</div>
				{:else}
					{#each orgDetail.members as member (member._id)}
						<div class="flex items-center gap-3">
							<Avatar.Root class="size-8">
								<Avatar.Image src={member.user?.image ?? undefined} alt={member.user?.name ?? ''} />
								<Avatar.Fallback>
									<Avatar.Marble name={member.user?.name ?? '?'} />
								</Avatar.Fallback>
							</Avatar.Root>
							<div class="flex flex-1 flex-col truncate">
								<span class="truncate text-sm">{member.user?.name ?? 'Unknown user'}</span>
								<span class="text-surface-700-300 truncate text-xs">{member.user?.email}</span>
							</div>
							<span class="badge preset-filled-surface-300-700 h-6 px-2 text-xs">{member.role}</span
							>
						</div>
					{/each}
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Delete dialog -->
	<Dialog.Root bind:open={deleteOpen}>
		<Dialog.Content class="md:max-w-108">
			<Dialog.Header>
				<Dialog.Title>Delete organization</Dialog.Title>
			</Dialog.Header>
			<Dialog.Description>
				Are you sure you want to permanently delete {selectedOrg?.name}? All members and invitations
				will be removed. This cannot be undone.
			</Dialog.Description>
			<Dialog.Footer>
				<button type="button" class="btn preset-tonal" onclick={() => (deleteOpen = false)}>
					Cancel
				</button>
				<button type="button" class="btn preset-filled-error-500" onclick={handleDelete}>
					Delete
				</button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</div>
