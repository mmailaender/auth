'use client';

import * as React from 'react';
import { Toggle as TogglePrimitive } from '@ark-ui/react/toggle';

type RootProps = Omit<React.ComponentProps<typeof TogglePrimitive.Root>, 'onPressedChange'> & {
	onPressedChange?: (pressed: boolean) => void;
};

function Root({ onPressedChange, ...props }: RootProps) {
	return <TogglePrimitive.Root onPressedChange={onPressedChange} {...props} />;
}

export { Root, Root as Toggle };
