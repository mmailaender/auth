<script lang="ts">
	// Icons
	import VenetianMaskIcon from '@lucide/svelte/icons/venetian-mask';
	// API
	import { useQuery } from 'convex-svelte';
	import { useAuth } from '@mmailaender/convex-better-auth-svelte/svelte';
	import { getAuthContext } from '$lib/auth/context.svelte';
	import { toast } from 'svelte-sonner';
	// Constants
	import { ADMIN_ROUTE } from '$lib/admin/utils/admin.constants';

	const { api, authClient } = getAuthContext();
	const auth = useAuth();

	const impersonationResponse = useQuery(api.admin.queries.getImpersonationStatus, () =>
		auth.isAuthenticated ? {} : 'skip'
	);
	const impersonation = $derived(impersonationResponse?.data);

	const activeUserResponse = useQuery(api.users.queries.getActiveUser, () =>
		auth.isAuthenticated ? {} : 'skip'
	);
	const activeUser = $derived(activeUserResponse?.data);

	let stopping = $state(false);

	async function handleStop() {
		stopping = true;
		const { error } = await authClient.admin.stopImpersonating();
		if (error) {
			stopping = false;
			toast.error(error.message ?? 'Failed to stop impersonating');
			return;
		}
		// Full reload so the Convex client picks up the restored admin session.
		window.location.href = ADMIN_ROUTE;
	}
</script>

<!--
	Fixed banner shown while the current session is an admin impersonation
	(`session.impersonatedBy` is set). Renders nothing otherwise. Mounted once in
	the root layout (gated by `AUTH_CONSTANTS.admin`) so an impersonating admin
	always sees who they are acting as and can return to their own session.
-->
{#if impersonation}
	<div
		class="preset-filled-warning-500 sticky top-0 z-50 flex min-w-0 items-center justify-center gap-3 px-4 py-2 text-sm"
	>
		<VenetianMaskIcon class="size-4 shrink-0" />
		<span class="truncate">
			You are impersonating <strong>{activeUser?.name ?? 'another user'}</strong>
		</span>
		<button
			type="button"
			class="btn btn-sm preset-outlined shrink-0"
			onclick={handleStop}
			disabled={stopping}
		>
			Stop impersonating
		</button>
	</div>
{/if}
