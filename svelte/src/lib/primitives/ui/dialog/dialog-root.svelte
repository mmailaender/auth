<script module lang="ts">
	let dialogIdCounter = 0;
</script>

<script lang="ts">
	import { Dialog as ArkDialog } from '@ark-ui/svelte/dialog';

	const fallbackId = `dialog-${++dialogIdCounter}`;

	let {
		open = $bindable(false),
		ids,
		onInteractOutside,
		...restProps
	}: ArkDialog.RootProps = $props();

	const resolvedIds = $derived({
		...ids,
		backdrop:
			typeof ids?.backdrop === 'string' && ids.backdrop.length > 0
				? ids.backdrop
				: `${fallbackId}-backdrop`,
		positioner:
			typeof ids?.positioner === 'string' && ids.positioner.length > 0
				? ids.positioner
				: `${fallbackId}-positioner`,
		content:
			typeof ids?.content === 'string' && ids.content.length > 0
				? ids.content
				: `${fallbackId}-content`
	});

	function handleInteractOutside(event: Parameters<NonNullable<ArkDialog.RootProps['onInteractOutside']>>[0]) {
		const originalEvent = event.detail?.originalEvent || event.detail;

		if (originalEvent instanceof Event && originalEvent.target instanceof Element) {
			const sonnerElement = originalEvent.target.closest('[data-sonner-toast]');
			if (sonnerElement) {
				event.preventDefault();
				return;
			}
		}

		onInteractOutside?.(event);
	}
</script>

<ArkDialog.Root
	bind:open
	ids={resolvedIds}
	onInteractOutside={handleInteractOutside}
	{...restProps}
/>
