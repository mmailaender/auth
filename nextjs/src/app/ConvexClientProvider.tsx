'use client';

import { ReactNode } from 'react';
import { ConvexReactClient } from 'convex/react';
import { authClient } from '../lib/auth/api/auth-client';
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react';
import { InitialAuthDataProvider } from '@/lib/auth/initial-data';
import type { InitialAuthData } from '@/lib/auth/types';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({
	children,
	initialToken,
	initialData
}: {
	children: ReactNode;
	initialToken?: string | null;
	initialData?: InitialAuthData;
}) {
	return (
		<ConvexBetterAuthProvider client={convex} authClient={authClient} initialToken={initialToken}>
			<InitialAuthDataProvider initialData={initialData}>{children}</InitialAuthDataProvider>
		</ConvexBetterAuthProvider>
	);
}
