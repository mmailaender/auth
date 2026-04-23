'use client';

import * as React from 'react';
import { Dialog as ArkDialog } from '@ark-ui/react/dialog';
import { XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type ArkRootProps = React.ComponentProps<typeof ArkDialog.Root>;
type RootProps = Omit<ArkRootProps, 'onOpenChange'> & {
	onOpenChange?: (open: boolean) => void;
};

function Root({ onOpenChange, ...props }: RootProps) {
	return (
		<ArkDialog.Root
			data-slot="dialog"
			onOpenChange={onOpenChange ? (details) => onOpenChange(details.open) : undefined}
			{...props}
		/>
	);
}

function Trigger({ ...props }: React.ComponentProps<typeof ArkDialog.Trigger>) {
	return <ArkDialog.Trigger data-slot="dialog-trigger" {...props} />;
}

function Close({ ...props }: React.ComponentProps<typeof ArkDialog.CloseTrigger>) {
	return <ArkDialog.CloseTrigger data-slot="dialog-close" {...props} />;
}

function CloseX({ className, children, ...props }: React.ComponentProps<typeof ArkDialog.CloseTrigger>) {
	return (
		<ArkDialog.CloseTrigger
			data-slot="dialog-close"
			aria-label="Close"
			className={cn(
				'hover:bg-surface-300-700 rounded-base absolute top-5 right-4 p-2 opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
				className
			)}
			{...props}
		>
			{children ?? <XIcon />}
			<span className="sr-only">Close</span>
		</ArkDialog.CloseTrigger>
	);
}

function Overlay({ className, ...props }: React.ComponentProps<typeof ArkDialog.Backdrop>) {
	return (
		<ArkDialog.Backdrop
			data-slot="dialog-overlay"
			className={cn(
				'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-surface-950/80 fixed inset-0 z-50',
				className
			)}
			{...props}
		/>
	);
}

function Portal({ children }: { children?: React.ReactNode }) {
	return <ArkDialog.Positioner data-slot="dialog-portal">{children}</ArkDialog.Positioner>;
}

type ContentProps = Omit<React.ComponentProps<typeof ArkDialog.Content>, 'onInteractOutside'> & {
	onInteractOutside?: (event: { preventDefault: () => void; detail: { originalEvent: Event } }) => void;
};

function Content({
	className,
	children,
	onInteractOutside,
	...props
}: ContentProps) {
	void onInteractOutside;
	return (
		<>
			<Overlay />
			<ArkDialog.Positioner className="fixed inset-0 z-50">
				<ArkDialog.Content
					data-slot="dialog-content"
					className={cn(
						'bg-surface-200-800 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-container fixed top-[50%] left-[50%] grid w-[90%] translate-x-[-50%] translate-y-[-50%] overflow-hidden p-6 duration-200 sm:w-4xl',
						className
					)}
					{...props}
				>
					{children}
				</ArkDialog.Content>
			</ArkDialog.Positioner>
		</>
	);
}

function Header({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="dialog-header"
			className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
			{...props}
		/>
	);
}

function Footer({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="dialog-footer"
			className={cn('flex justify-end gap-2 pt-6 md:flex-row', className)}
			{...props}
		/>
	);
}

function Title({ className, ...props }: React.ComponentProps<typeof ArkDialog.Title>) {
	return (
		<ArkDialog.Title
			data-slot="dialog-title"
			className={cn('pb-6 text-left text-xl leading-none tracking-tight', className)}
			{...props}
		/>
	);
}

function Description({ className, ...props }: React.ComponentProps<typeof ArkDialog.Description>) {
	return (
		<ArkDialog.Description
			data-slot="dialog-description"
			className={cn('text-surface-600-400 w-full text-left text-sm', className)}
			{...props}
		/>
	);
}

export {
	Root,
	Title,
	Portal,
	Footer,
	Header,
	Trigger,
	Overlay,
	Content,
	Description,
	Close,
	CloseX,
	Root as Dialog,
	Title as DialogTitle,
	Portal as DialogPortal,
	Footer as DialogFooter,
	Header as DialogHeader,
	Trigger as DialogTrigger,
	Overlay as DialogOverlay,
	Content as DialogContent,
	Description as DialogDescription,
	Close as DialogClose,
	CloseX as DialogCloseX
};
