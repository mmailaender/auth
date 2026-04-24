'use client';

import * as React from 'react';
import { Toggle as ArkToggle } from '@ark-ui/react/toggle';

type RootProps = Omit<React.ComponentProps<typeof ArkToggle.Root>, 'onPressedChange'> & {
	onPressedChange?: (pressed: boolean) => void;
};

function Root({ onPressedChange, ...props }: RootProps) {
	return <ArkToggle.Root onPressedChange={onPressedChange} {...props} />;
}

export { Root };
