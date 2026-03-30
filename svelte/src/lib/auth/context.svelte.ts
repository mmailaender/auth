import { createContext } from 'svelte';
import type { AuthContext } from './types';

/**
 * Svelte context for auth dependencies (`api`, `authClient`, `authConstants`).
 *
 * - `setAuthContext` — call in `AuthProvider` during component initialization.
 * - `getAuthContext` — call in any descendant component during initialization.
 */
export const [getAuthContext, setAuthContext] = createContext<AuthContext>();
