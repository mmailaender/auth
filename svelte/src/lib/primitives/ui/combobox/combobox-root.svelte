<script lang="ts">
	import { ComboboxRoot as ArkComboboxRoot } from '@ark-ui/svelte/combobox';
	import type { ComboboxRootProps as ArkComboboxRootProps } from '@ark-ui/svelte/combobox';
	import type { CollectionItem } from '@ark-ui/svelte/collection';
	import { cn } from '$lib/primitives/utils.js';

	type ComboboxRootProps = ArkComboboxRootProps<CollectionItem> & {
		class?: string;
	};

	let { ref = $bindable(null), class: className, ...restProps }: ComboboxRootProps = $props();
</script>

<ArkComboboxRoot bind:ref class={cn('relative', className)} {...restProps} />
