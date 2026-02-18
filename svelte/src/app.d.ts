// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			token: string | undefined;
		}
		// interface PageData {}
		interface PageState {
			dialog?: 'user-profile' | 'organization-profile';
		}
		// interface Platform {}
	}
}

declare module '$app/paths' {
	import type { Pathname, ResolvedPathname } from '$app/types';

	export function resolve(path: Pathname): ResolvedPathname;
}

export {};
