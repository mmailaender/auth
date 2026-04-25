<script lang="ts">
	import { Select as SelectPrimitive } from '@ark-ui/svelte/select';

	let { ref = $bindable(null), children, ...restProps }: SelectPrimitive.ItemGroupProps = $props();
</script>

<SelectPrimitive.ItemGroup bind:ref data-slot="select-group" {...restProps}>
	{@render children?.()}
</SelectPrimitive.ItemGroup>
