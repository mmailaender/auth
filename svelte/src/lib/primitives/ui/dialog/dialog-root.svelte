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

	function hasOpenDialogAboveCurrent() {
		if (typeof document === 'undefined') return false;

		const openPositioners = Array.from(
			document.querySelectorAll<HTMLElement>(
				'[data-scope="dialog"][data-part="positioner"][data-state="open"]'
			)
		).filter((element) => !element.hidden);

		const currentIndex = openPositioners.findIndex(
			(element) => element.id === resolvedIds.positioner
		);

		return currentIndex !== -1 && currentIndex < openPositioners.length - 1;
	}

	function handleInteractOutside(event: Parameters<NonNullable<ArkDialog.RootProps['onInteractOutside']>>[0]) {
		// Only the top-most dialog should react to outside interactions.
		// Without this, clicking a nested dialog backdrop can also dismiss the parent dialog.
		if (hasOpenDialogAboveCurrent()) {
			event.preventDefault();
			return;
		}

		// Access the original DOM event from Ark UI's synthetic event
		const originalEvent = event.detail?.originalEvent || event.detail;

		if (originalEvent && originalEvent.target instanceof Element) {
			// Prevent dialog dismissal when interacting with Sonner toasts.
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
