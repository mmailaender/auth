'use client';

import * as React from 'react';
import { Tabs as ArkTabs } from '@ark-ui/react/tabs';

import { cn } from '@/lib/utils';

type ArkRootProps = React.ComponentProps<typeof ArkTabs.Root>;
type RootProps = Omit<ArkRootProps, 'onValueChange'> & {
	onValueChange?: (value: string) => void;
};

function Root({ className, onValueChange, ...props }: RootProps) {
	return (
		<ArkTabs.Root
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

function List({ className, ...props }: React.ComponentProps<typeof ArkTabs.List>) {
	return (
		<ArkTabs.List
			data-slot="tabs-list"
			className={cn(
				'text-surface-700-300 rounded-base bg-transparent',
				'inline-flex items-center justify-center',
				'data-[orientation=horizontal]:w-fit',
				'h-full gap-1 data-[orientation=vertical]:w-full data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:justify-start',
				className
			)}
			{...props}
		/>
	);
}

function Trigger({ className, ...props }: React.ComponentProps<typeof ArkTabs.Trigger>) {
	return (
		<ArkTabs.Trigger
			data-slot="tabs-trigger"
			className={cn(
				'data-[selected]:bg-surface-400-600/50 data-[selected]:text-surface-950-50 aria-selected:bg-surface-400-600/50 aria-selected:text-surface-950-50 text-surface-700-300 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring rounded-base inline-flex items-center px-3 py-2 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
				'data-[orientation=horizontal]:h-[calc(100%-1px)] data-[orientation=horizontal]:flex-1 data-[orientation=horizontal]:justify-center',
				'hover:bg-surface-400-600/30 hover:text-surface-950-50 data-[orientation=vertical]:w-full data-[orientation=vertical]:justify-start data-[orientation=vertical]:text-left',
				className
			)}
			{...props}
		/>
	);
}

function Content({ className, ...props }: React.ComponentProps<typeof ArkTabs.Content>) {
	return (
		<ArkTabs.Content
			data-slot="tabs-content"
			className={cn(
				'outline-none',
				'data-[orientation=horizontal]:flex-1',
				'w-full data-[orientation=vertical]:p-6',
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
