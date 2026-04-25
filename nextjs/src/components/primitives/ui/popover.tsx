'use client';

import * as React from 'react';
import { Popover as PopoverPrimitive } from '@ark-ui/react/popover';

import { cn } from '@/lib/utils';

type RootPrimitiveProps = React.ComponentProps<typeof PopoverPrimitive.Root>;
type RootProps = Omit<RootPrimitiveProps, 'onOpenChange'> & {
	onOpenChange?: (open: boolean) => void;
};

function Root({ onOpenChange, positioning, ...props }: RootProps) {
	return (
		<PopoverPrimitive.Root
			data-slot="popover"
			positioning={{
				placement: 'bottom',
				offset: { mainAxis: 8, crossAxis: 0 },
				...positioning
			}}
			onOpenChange={onOpenChange ? (details) => onOpenChange(details.open) : undefined}
			{...props}
		/>
	);
}

function Trigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
	return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

type ContentProps = React.ComponentProps<typeof PopoverPrimitive.Content> & {
	side?: 'top' | 'right' | 'bottom' | 'left';
	align?: 'start' | 'center' | 'end';
	sideOffset?: number;
};

function Content({ className, side, align, sideOffset, ...props }: ContentProps) {
	void side;
	void align;
	void sideOffset;
	return (
		<PopoverPrimitive.Positioner>
			<PopoverPrimitive.Content
				data-slot="popover-content"
				className={cn(
					'bg-surface-200-800 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-container z-50 w-80 p-1 outline-hidden',
					className
				)}
				{...props}
			/>
		</PopoverPrimitive.Positioner>
	);
}

function Anchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
	return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
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
