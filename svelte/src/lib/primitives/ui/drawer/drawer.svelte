<script lang="ts">
	import { Dialog as DialogPrimitive } from '@ark-ui/svelte/dialog';

	let {
		open = $bindable(false),
		onInteractOutside,
		...restProps
	}: DialogPrimitive.RootProps = $props();
</script>

<DialogPrimitive.Root
	bind:open
	onInteractOutside={onInteractOutside
		? onInteractOutside
		: (e) => {
				const originalEvent = e.detail?.originalEvent || e.detail;
				if (originalEvent && originalEvent.target instanceof Element) {
					const sonnerElement = originalEvent.target.closest('[data-sonner-toast]');
					if (sonnerElement) {
						e.preventDefault();
						return;
					}
				}
			}}
	{...restProps}
/>
