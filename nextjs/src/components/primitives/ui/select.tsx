'use client';

import * as React from 'react';
import {
	Select as SelectPrimitive,
	createListCollection,
	type ListCollection
} from '@ark-ui/react/select';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type SelectOption = { label: string; value: string };

type RootProps = Omit<
	React.ComponentProps<typeof SelectPrimitive.Root<SelectOption>>,
	'collection' | 'onValueChange' | 'onSelect'
> & {
	collection: ListCollection<SelectOption>;
	onValueChange?: (details: { value: string[] }) => void;
	onSelect?: (details: { value: string }) => void;
};

function Root({ children, onValueChange, onSelect, ...props }: RootProps) {
	return (
		<SelectPrimitive.Root<SelectOption>
			data-slot="select"
			onValueChange={(details) => {
				onValueChange?.(details);
				const value = details.value[0];
				if (value) onSelect?.({ value });
			}}
			{...props}
		>
			<SelectPrimitive.HiddenSelect />
			{children}
		</SelectPrimitive.Root>
	);
}

type TriggerProps = React.ComponentProps<typeof SelectPrimitive.Trigger> & {
	placeholder?: string;
	size?: 'sm' | 'default';
};

function Trigger({ className, placeholder, size = 'default', children, ...props }: TriggerProps) {
	return (
		<SelectPrimitive.Control className="w-full">
			<SelectPrimitive.Trigger
				data-slot="select-trigger"
				data-size={size}
				className={cn(
					"data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 border-surface-400-600 rounded-base hover:border-surface-500 flex w-fit items-center justify-between gap-2 border bg-transparent px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none select-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
					className
				)}
				{...props}
			>
				{children ?? <SelectPrimitive.ValueText placeholder={placeholder} />}
				<SelectPrimitive.Indicator>
					<ChevronDownIcon className="size-4" />
				</SelectPrimitive.Indicator>
			</SelectPrimitive.Trigger>
		</SelectPrimitive.Control>
	);
}

function Content({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
	return (
		<SelectPrimitive.Positioner>
			<SelectPrimitive.Content
				data-slot="select-content"
				className={cn(
					'bg-surface-100-900 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 border-surface-300-700 rounded-container relative z-50 max-h-(--available-height) w-(--reference-width) min-w-[8rem] overflow-x-hidden overflow-y-auto border p-1 shadow-md data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
					className
				)}
				{...props}
			/>
		</SelectPrimitive.Positioner>
	);
}

function Item({
	className,
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
	return (
		<SelectPrimitive.Item
			data-slot="select-item"
			className={cn(
				'hover:bg-surface-200-800 data-[highlighted]:bg-surface-200-800 rounded-base flex cursor-pointer items-center gap-2 px-2 py-2 text-sm outline-hidden',
				className
			)}
			{...props}
		>
			{children}
			<SelectPrimitive.ItemIndicator className="ml-auto">
				<CheckIcon className="size-4" />
			</SelectPrimitive.ItemIndicator>
		</SelectPrimitive.Item>
	);
}

function ItemText(props: React.ComponentProps<typeof SelectPrimitive.ItemText>) {
	return <SelectPrimitive.ItemText data-slot="select-item-text" {...props} />;
}

function Label(props: React.ComponentProps<typeof SelectPrimitive.Label>) {
	return <SelectPrimitive.Label data-slot="select-label" {...props} />;
}

export {
	Root,
	Trigger,
	Content,
	Item,
	ItemText,
	Label,
	createListCollection,
	Root as Select,
	Trigger as SelectTrigger,
	Content as SelectContent,
	Item as SelectItem,
	ItemText as SelectItemText,
	Label as SelectLabel
};
