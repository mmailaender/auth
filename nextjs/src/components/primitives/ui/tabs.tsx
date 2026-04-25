'use client';

import * as React from 'react';
import { Tabs as TabsPrimitive } from '@ark-ui/react/tabs';

import { cn } from '@/lib/utils';

type RootPrimitiveProps = React.ComponentProps<typeof TabsPrimitive.Root>;
type RootProps = Omit<RootPrimitiveProps, 'onValueChange'> & {
	onValueChange?: (value: string) => void;
};

function Root({ className, onValueChange, ...props }: RootProps) {
	return (
		<TabsPrimitive.Root
			data-slot="tabs"
			className={cn(
				'flex',
				'data-[orientation=vertical]:w-full data-[orientation=vertical]:shrink-0 data-[orientation=vertical]:flex-row data-[orientation=vertical]:items-start',
				'data-[orientation=horizontal]:flex-col',
				className
			)}
			onValueChange={onValueChange ? (details) => onValueChange(details.value) : undefined}
			{...props}
		/>
	);
}

function List({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
	return (
		<TabsPrimitive.List
			data-slot="tabs-list"
			className={cn(
				'text-surface-700-300 rounded-base bg-transparent',
				'inline-flex items-center justify-center',
				'data-[orientation=horizontal]:w-fit',
				'gap-1 data-[orientation=vertical]:w-full data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:justify-start',
				className
			)}
			{...props}
		/>
	);
}

function Trigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
	return (
		<TabsPrimitive.Trigger
			data-slot="tabs-trigger"
			className={cn(
				'aria-selected:bg-surface-400/50 dark:aria-selected:bg-surface-700/50 aria-selected:text-surface-950-50 text-surface-700 dark:text-surface-400 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring rounded-base inline-flex items-center px-3 py-2 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
				'data-[orientation=horizontal]:h-[calc(100%-1px)] data-[orientation=horizontal]:flex-1 data-[orientation=horizontal]:justify-center',
				'hover:bg-surface-500/20 hover:text-surface-950-50 data-[orientation=vertical]:w-full data-[orientation=vertical]:justify-start data-[orientation=vertical]:text-left',
				className
			)}
			{...props}
		/>
	);
}

function Content({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
	return (
		<TabsPrimitive.Content
			data-slot="tabs-content"
			className={cn(
				'outline-none',
				'data-[orientation=horizontal]:flex-1',
				'w-full data-[orientation=vertical]:p-8 data-[orientation=vertical]:pt-6',
				className
			)}
			{...props}
		/>
	);
}

export {
	Root,
	Content,
	List,
	Trigger,
	Root as Tabs,
	List as TabsList,
	Trigger as TabsTrigger,
	Content as TabsContent
};
