'use client';

import * as React from 'react';
import { Popover as ArkPopover } from '@ark-ui/react/popover';

import { cn } from '@/lib/utils';

type ArkRootProps = React.ComponentProps<typeof ArkPopover.Root>;
type RootProps = Omit<ArkRootProps, 'onOpenChange'> & {
	onOpenChange?: (open: boolean) => void;
};

function Root({ onOpenChange, positioning, ...props }: RootProps) {
	return (
		<ArkPopover.Root
			data-slot="popover"
			positioning={{
				placement: 'bottom-end',
				offset: { mainAxis: 8, crossAxis: 0 },
				...positioning
			}}
			onOpenChange={onOpenChange ? (details) => onOpenChange(details.open) : undefined}
			{...props}
		/>
	);
}

function Trigger({ ...props }: React.ComponentProps<typeof ArkPopover.Trigger>) {
	return <ArkPopover.Trigger data-slot="popover-trigger" {...props} />;
}

type ContentProps = React.ComponentProps<typeof ArkPopover.Content> & {
	side?: 'top' | 'right' | 'bottom' | 'left';
	align?: 'start' | 'center' | 'end';
	sideOffset?: number;
};

function Content({ className, side, align, sideOffset, ...props }: ContentProps) {
	void side;
	void align;
	void sideOffset;
	return (
		<ArkPopover.Positioner>
			<ArkPopover.Content
				data-slot="popover-content"
				className={cn(
					'bg-surface-200-800 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-container z-50 w-80 p-1 outline-hidden',
					className
				)}
				{...props}
			/>
		</ArkPopover.Positioner>
	);
}

function Anchor({ ...props }: React.ComponentProps<typeof ArkPopover.Anchor>) {
	return <ArkPopover.Anchor data-slot="popover-anchor" {...props} />;
}

export {
	Root,
	Content,
	Trigger,
	Anchor,
	Root as Popover,
	Trigger as PopoverTrigger,
	Content as PopoverContent,
	Anchor as PopoverAnchor
};
