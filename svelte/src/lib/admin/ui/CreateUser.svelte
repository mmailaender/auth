<script lang="ts">
	// Primitives
	import * as Dialog from '$lib/primitives/ui/dialog';
	// Icons
	import PlusIcon from '@lucide/svelte/icons/plus';
	// API
	import { useConvexClient } from 'convex-svelte';
	import { getAuthContext } from '$lib/auth/context.svelte';
	import { toast } from 'svelte-sonner';

	const { api } = getAuthContext();
	const client = useConvexClient();

	let open = $state(false);
	let name = $state('');
	let email = $state('');
	let password = $state('');
	let role = $state('user');
	let submitting = $state(false);

	function reset() {
		name = '';
		email = '';
		password = '';
		role = 'user';
	}

	async function handleSubmit() {
		submitting = true;
		try {
			await client.mutation(api.admin.mutations.createUser, { name, email, password, role });
			toast.success('User created');
			open = false;
			reset();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to create user');
		} finally {
			submitting = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class="btn preset-filled-primary-500 gap-2">
		<PlusIcon class="size-4" />
		<span class="hidden sm:inline">New user</span>
	</Dialog.Trigger>
	<Dialog.Content class="md:max-w-108">
		<Dialog.Header>
			<Dialog.Title>Create user</Dialog.Title>
		</Dialog.Header>
		<div class="flex flex-col gap-3">
			<label class="label">
				<span>Name</span>
				<input type="text" class="input" bind:value={name} />
			</label>
			<label class="label">
				<span>Email</span>
				<input type="email" class="input" bind:value={email} />
			</label>
			<label class="label">
				<span>Password</span>
				<input type="password" class="input" bind:value={password} />
			</label>
			<label class="label">
				<span>Role</span>
				<select class="select" bind:value={role}>
					<option value="user">User</option>
					<option value="admin">Admin</option>
				</select>
			</label>
		</div>
		<Dialog.Footer>
			<button type="button" class="btn preset-tonal" onclick={() => (open = false)}>Cancel</button>
			<button
				type="button"
				class="btn preset-filled-primary-500"
				onclick={handleSubmit}
				disabled={submitting || !name || !email || !password}
			>
				Create
			</button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
