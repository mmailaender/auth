'use client';

import * as React from 'react';
import { Avatar as ArkAvatar } from '@ark-ui/react/avatar';
import AvatarMarble from './avatar-marble';

import { cn } from '@/lib/utils';

function Avatar({ className, ...props }: React.ComponentProps<typeof ArkAvatar.Root>) {
	return (
		<ArkAvatar.Root
			data-slot="avatar"
			className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
			{...props}
		/>
	);
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof ArkAvatar.Image>) {
	return (
		<ArkAvatar.Image
			data-slot="avatar-image"
			className={cn('aspect-square size-full', className)}
			{...props}
		/>
	);
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof ArkAvatar.Fallback>) {
	return (
		<ArkAvatar.Fallback
			data-slot="avatar-fallback"
			className={cn('bg-muted flex size-full items-center justify-center rounded-full', className)}
			{...props}
		/>
	);
}

export {
	Avatar as Root,
	AvatarImage as Image,
	AvatarFallback as Fallback,
	AvatarMarble as Marble,
	Avatar,
	AvatarImage,
	AvatarFallback,
	AvatarMarble
};
