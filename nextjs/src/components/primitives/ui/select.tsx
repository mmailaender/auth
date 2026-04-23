'use client';

import * as React from 'react';
import {
	Select as ArkSelect,
	createListCollection,
	type ListCollection
} from '@ark-ui/react/select';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type SelectOption = { label: string; value: string };

type RootProps = Omit<
	React.ComponentProps<typeof ArkSelect.Root<SelectOption>>,
	'collection' | 'onValueChange' | 'onSelect'
> & {
	collection: ListCollection<SelectOption>;
	onValueChange?: (details: { value: string[] }) => void;
	onSelect?: (details: { value: string }) => void;
};

function Root({ children, onValueChange, onSelect, ...props }: RootProps) {
	return (
		<ArkSelect.Root<SelectOption>
			data-slot="select"
			onValueChange={(details) => {
				onValueChange?.(details);
				const value = details.value[0];
				if (value) onSelect?.({ value });
			}}
			{...props}
		>
			<ArkSelect.HiddenSelect />
			{children}
		</ArkSelect.Root>
	);
}

type TriggerProps = React.ComponentProps<typeof ArkSelect.Trigger> & {
	placeholder?: string;
};

function Trigger({ className, placeholder, children, ...props }: TriggerProps) {
	return (
		<ArkSelect.Control className="w-full">
			<ArkSelect.Trigger
				data-slot="select-trigger"
				className={cn(
					'select flex h-9 w-full items-center justify-between gap-2 rounded-container bg-surface-50-950 px-2.5 text-left text-sm',
					className
				)}
				{...props}
			>
				{children ?? <ArkSelect.ValueText placeholder={placeholder} />}
				<ArkSelect.Indicator>
					<ChevronDownIcon className="size-4 opacity-60" />
				</ArkSelect.Indicator>
			</ArkSelect.Trigger>
		</ArkSelect.Control>
	);
}

function Content({ className, ...props }: React.ComponentProps<typeof ArkSelect.Content>) {
	return (
		<ArkSelect.Positioner>
			<ArkSelect.Content
				data-slot="select-content"
				className={cn(
					'bg-surface-50-950 rounded-container z-50 max-h-72 min-w-44 overflow-auto border border-surface-300-700 p-1 shadow-lg outline-hidden',
					className
				)}
				{...props}
			/>
		</ArkSelect.Positioner>
	);
}

function Item({ className, children, ...props }: React.ComponentProps<typeof ArkSelect.Item>) {
	return (
		<ArkSelect.Item
			data-slot="select-item"
			className={cn(
				'hover:bg-surface-200-800 data-[highlighted]:bg-surface-200-800 rounded-base flex cursor-pointer items-center gap-2 px-2 py-2 text-sm outline-hidden',
				className
			)}
			{...props}
		>
			{children}
			<ArkSelect.ItemIndicator className="ml-auto">
				<CheckIcon className="size-4" />
			</ArkSelect.ItemIndicator>
		</ArkSelect.Item>
	);
}

function ItemText(props: React.ComponentProps<typeof ArkSelect.ItemText>) {
	return <ArkSelect.ItemText data-slot="select-item-text" {...props} />;
}

function Label(props: React.ComponentProps<typeof ArkSelect.Label>) {
	return <ArkSelect.Label data-slot="select-label" {...props} />;
}

export { Root, Trigger, Content, Item, ItemText, Label, createListCollection };
