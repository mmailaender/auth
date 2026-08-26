<script lang="ts">
	// Primitives
	import * as Avatar from '$lib/primitives/ui/avatar';
	import * as Dialog from '$lib/primitives/ui/dialog';
	// Icons
	import SearchIcon from '@lucide/svelte/icons/search';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import KeyIcon from '@lucide/svelte/icons/key-round';
	import LogInIcon from '@lucide/svelte/icons/log-in';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import ShieldBanIcon from '@lucide/svelte/icons/shield-ban';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	// Components
	import CreateUser from '$lib/admin/ui/CreateUser.svelte';
	// API
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { useAuth } from '@mmailaender/convex-better-auth-svelte/svelte';
	import { getAuthContext } from '$lib/auth/context.svelte';
	import { toast } from 'svelte-sonner';

	type AdminUserRow = {
		id: string;
		name: string;
		email: string;
		image?: string | null;
		role?: string | null;
		banned?: boolean | null;
	};

	const { api, authClient } = getAuthContext();
	const client = useConvexClient();
	const auth = useAuth();

	let searchQuery = $state('');
	let limit = $state(50);

	const activeUserResponse = useQuery(api.users.queries.getActiveUser, () =>
		auth.isAuthenticated ? {} : 'skip'
	);
	const activeUser = $derived(activeUserResponse?.data);

	const usersResponse = useQuery(api.admin.queries.listUsers, () => ({
		searchValue: searchQuery || undefined,
		limit
	}));
	const users = $derived((usersResponse?.data?.users ?? []) as AdminUserRow[]);
	const total = $derived(usersResponse?.data?.total ?? 0);
	const isLoading = $derived(usersResponse?.isLoading ?? true);

	// Dialog state
	let selectedUser = $state<AdminUserRow | null>(null);
	let banDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);
	let passwordDialogOpen = $state(false);
	let banReason = $state('');
	let banExpiresIn = $state('');
	let newPassword = $state('');

	const isSelf = (user: AdminUserRow) => user.id === activeUser?._id;

	async function handleRoleChange(user: AdminUserRow, role: string) {
		try {
			await client.mutation(api.admin.mutations.setRole, { userId: user.id, role });
			toast.success('Role updated');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to update role');
		}
	}

	async function handleUnban(user: AdminUserRow) {
		try {
			await client.mutation(api.admin.mutations.unbanUser, { userId: user.id });
			toast.success('User unbanned');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to unban user');
		}
	}

	async function handleBanSubmit() {
		if (!selectedUser) return;
		try {
			await client.mutation(api.admin.mutations.banUser, {
				userId: selectedUser.id,
				banReason: banReason || undefined,
				banExpiresIn: banExpiresIn ? Number(banExpiresIn) : undefined
			});
			toast.success('User banned');
			banDialogOpen = false;
			banReason = '';
			banExpiresIn = '';
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to ban user');
		}
	}

	async function handleDeleteSubmit() {
		if (!selectedUser) return;
		try {
			await client.mutation(api.admin.mutations.removeUser, { userId: selectedUser.id });
			toast.success('User deleted');
			deleteDialogOpen = false;
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to delete user');
		}
	}

	async function handlePasswordSubmit() {
		if (!selectedUser) return;
		try {
			await client.mutation(api.admin.mutations.setUserPassword, {
				userId: selectedUser.id,
				newPassword
			});
			toast.success('Password updated');
			passwordDialogOpen = false;
			newPassword = '';
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to set password');
		}
	}

	async function handleRevokeSessions(user: AdminUserRow) {
		try {
			await client.mutation(api.admin.mutations.revokeUserSessions, { userId: user.id });
			toast.success(`Signed ${user.name} out everywhere`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to revoke sessions');
		}
	}

	async function handleImpersonate(user: AdminUserRow) {
		const { error } = await authClient.admin.impersonateUser({ userId: user.id });
		if (error) {
			toast.error(error.message ?? 'Failed to impersonate user');
			return;
		}
		toast.success(`Impersonating ${user.name}`);
		window.location.href = '/';
	}

	function roleValue(user: AdminUserRow) {
		return (user.role ?? 'user').includes('admin') ? 'admin' : 'user';
	}
</script>

<div class="flex h-full flex-col">
	<div class="flex flex-shrink-0 items-center gap-3 py-4">
		<div class="relative flex-1">
			<div class="pointer-events-none absolute inset-y-0 flex items-center">
				<SearchIcon class="text-surface-400-600 size-4" />
			</div>
			<input
				type="text"
				class="input w-full !border-0 border-transparent pl-6 text-sm"
				placeholder="Search users..."
				bind:value={searchQuery}
			/>
		</div>
		<CreateUser />
	</div>

	{#if isLoading}
		<div class="p-4 text-sm opacity-60">Loading users...</div>
	{:else if users.length === 0}
		<div class="p-4 text-sm opacity-60">No users found.</div>
	{:else}
		<div class="max-h-[calc(80vh-12rem)] overflow-y-auto pb-12">
			<table class="table w-full">
				<thead class="sticky top-0 z-20">
					<tr>
						<th class="text-surface-600-400 p-2 !pl-3 text-left text-xs font-semibold">Name</th>
						<th class="text-surface-600-400 hidden p-2 text-left text-xs sm:table-cell">Email</th>
						<th class="text-surface-600-400 !w-32 p-2 text-left text-xs">Role</th>
						<th class="!w-32 p-2 text-right"></th>
					</tr>
				</thead>
				<tbody>
					{#each users as user (user.id)}
						<tr class="!border-surface-300-700 !border-t">
							<td class="!py-3 !pl-3">
								<div class="flex items-center space-x-2">
									<Avatar.Root class="size-8 sm:size-6">
										<Avatar.Image src={user.image ?? undefined} alt={user.name} />
										<Avatar.Fallback>
											<Avatar.Marble name={user.name} />
										</Avatar.Fallback>
									</Avatar.Root>
									<div class="flex flex-col truncate">
										<span class="truncate text-sm">
											{user.name}
											{#if user.banned}
												<span
													class="badge preset-filled-error-50-950 border-error-200-800 ml-2 h-5 border px-2"
												>
													Banned
												</span>
											{/if}
										</span>
										<span class="text-surface-700-300 truncate text-xs sm:hidden">{user.email}</span
										>
									</div>
								</div>
							</td>
							<td class="!text-surface-600-400 hidden !truncate text-sm sm:table-cell">
								{user.email}
							</td>
							<td class="!w-32">
								{#if isSelf(user)}
									<span
										class="badge preset-filled-warning-50-950 border-warning-200-800 h-7 border px-2"
									>
										{user.role ?? 'user'}
									</span>
								{:else}
									<select
										value={roleValue(user)}
										onchange={(e) => handleRoleChange(user, e.currentTarget.value)}
										class="select cursor-pointer text-sm"
									>
										<option value="user">User</option>
										<option value="admin">Admin</option>
									</select>
								{/if}
							</td>
							<td class="!w-32">
								<div class="flex justify-end gap-1">
									{#if !isSelf(user)}
										<button
											type="button"
											title="Impersonate"
											class="btn-icon preset-filled-surface-200-800 hover:preset-filled-primary-300-700"
											onclick={() => handleImpersonate(user)}
										>
											<LogInIcon class="size-4 opacity-70" />
										</button>
										<button
											type="button"
											title="Set password"
											class="btn-icon preset-filled-surface-200-800"
											onclick={() => {
												selectedUser = user;
												passwordDialogOpen = true;
											}}
										>
											<KeyIcon class="size-4 opacity-70" />
										</button>
										<button
											type="button"
											title="Revoke sessions"
											class="btn-icon preset-filled-surface-200-800"
											onclick={() => handleRevokeSessions(user)}
										>
											<LogOutIcon class="size-4 opacity-70" />
										</button>
										{#if user.banned}
											<button
												type="button"
												title="Unban"
												class="btn-icon preset-filled-surface-200-800 hover:preset-filled-success-300-700"
												onclick={() => handleUnban(user)}
											>
												<ShieldCheckIcon class="size-4 opacity-70" />
											</button>
										{:else}
											<button
												type="button"
												title="Ban"
												class="btn-icon preset-filled-surface-200-800 hover:preset-filled-warning-300-700"
												onclick={() => {
													selectedUser = user;
													banDialogOpen = true;
												}}
											>
												<ShieldBanIcon class="size-4 opacity-70" />
											</button>
										{/if}
										<button
											type="button"
											title="Delete"
											class="btn-icon preset-filled-surface-200-800 hover:preset-filled-error-300-700"
											onclick={() => {
												selectedUser = user;
												deleteDialogOpen = true;
											}}
										>
											<TrashIcon class="size-4 opacity-70" />
										</button>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			{#if users.length < total}
				<div class="flex justify-center py-3">
					<button type="button" class="btn preset-tonal" onclick={() => (limit += 50)}>
						Load more
					</button>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Ban dialog -->
	<Dialog.Root bind:open={banDialogOpen}>
		<Dialog.Content class="md:max-w-108">
			<Dialog.Header>
				<Dialog.Title>Ban {selectedUser?.name}</Dialog.Title>
			</Dialog.Header>
			<div class="flex flex-col gap-3">
				<label class="label">
					<span>Reason (optional)</span>
					<input
						type="text"
						class="input"
						bind:value={banReason}
						placeholder="Violation of terms"
					/>
				</label>
				<label class="label">
					<span>Duration</span>
					<select class="select" bind:value={banExpiresIn}>
						<option value="">Permanent</option>
						<option value={String(60 * 60 * 24)}>1 day</option>
						<option value={String(60 * 60 * 24 * 7)}>7 days</option>
						<option value={String(60 * 60 * 24 * 30)}>30 days</option>
					</select>
				</label>
			</div>
			<Dialog.Footer>
				<button type="button" class="btn preset-tonal" onclick={() => (banDialogOpen = false)}>
					Cancel
				</button>
				<button type="button" class="btn preset-filled-warning-500" onclick={handleBanSubmit}>
					Ban user
				</button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Set password dialog -->
	<Dialog.Root bind:open={passwordDialogOpen}>
		<Dialog.Content class="md:max-w-108">
			<Dialog.Header>
				<Dialog.Title>Set password for {selectedUser?.name}</Dialog.Title>
			</Dialog.Header>
			<label class="label">
				<span>New password</span>
				<input type="password" class="input" bind:value={newPassword} />
			</label>
			<Dialog.Footer>
				<button type="button" class="btn preset-tonal" onclick={() => (passwordDialogOpen = false)}>
					Cancel
				</button>
				<button
					type="button"
					class="btn preset-filled-primary-500"
					onclick={handlePasswordSubmit}
					disabled={!newPassword}
				>
					Save
				</button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Delete dialog -->
	<Dialog.Root bind:open={deleteDialogOpen}>
		<Dialog.Content class="md:max-w-108">
			<Dialog.Header>
				<Dialog.Title>Delete user</Dialog.Title>
			</Dialog.Header>
			<Dialog.Description>
				Are you sure you want to permanently delete {selectedUser?.name}? This cannot be undone.
			</Dialog.Description>
			<Dialog.Footer>
				<button type="button" class="btn preset-tonal" onclick={() => (deleteDialogOpen = false)}>
					Cancel
				</button>
				<button type="button" class="btn preset-filled-error-500" onclick={handleDeleteSubmit}>
					Delete
				</button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</div>
