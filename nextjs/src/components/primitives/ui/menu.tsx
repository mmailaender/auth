'use client';

import * as React from 'react';
import { Menu as ArkMenu } from '@ark-ui/react/menu';

import { cn } from '@/lib/utils';

type RootProps = Omit<React.ComponentProps<typeof ArkMenu.Root>, 'onOpenChange'> & {
	onOpenChange?: (open: boolean) => void;
};

function Root({ onOpenChange, positioning, ...props }: RootProps) {
	return (
		<ArkMenu.Root
			data-slot="menu"
			positioning={{ placement: 'bottom-end', ...positioning }}
			onOpenChange={onOpenChange ? (details) => onOpenChange(details.open) : undefined}
			{...props}
		/>
	);
}

function Trigger({ ...props }: React.ComponentProps<typeof ArkMenu.Trigger>) {
	return <ArkMenu.Trigger data-slot="menu-trigger" {...props} />;
}

function Content({ className, ...props }: React.ComponentProps<typeof ArkMenu.Content>) {
	return (
		<ArkMenu.Positioner>
			<ArkMenu.Content
				data-slot="menu-content"
				className={cn(
					'bg-surface-50-950 rounded-container border-surface-300-700 z-50 min-w-36 border p-1 shadow-lg outline-hidden',
					className
				)}
				{...props}
			/>
		</ArkMenu.Positioner>
	);
}

type ItemProps = React.ComponentProps<typeof ArkMenu.Item> & {
	variant?: 'default' | 'destructive';
};

function Item({ className, variant = 'default', ...props }: ItemProps) {
	return (
		<ArkMenu.Item
			data-slot="menu-item"
			className={cn(
				'hover:bg-surface-200-800 data-[highlighted]:bg-surface-200-800 rounded-base flex cursor-pointer items-center gap-2 px-2 py-2 text-sm outline-hidden',
				variant === 'destructive' &&
					'text-error-600-400 hover:bg-error-300-700 hover:text-error-950-50 data-[highlighted]:bg-error-300-700 data-[highlighted]:text-error-950-50',
				className
			)}
			{...props}
		/>
	);
}

function Separator({ className, ...props }: React.ComponentProps<typeof ArkMenu.Separator>) {
	return <ArkMenu.Separator className={cn('bg-surface-300-700 my-1 h-px', className)} {...props} />;
}

export { Root, Trigger, Content, Item, Separator };
