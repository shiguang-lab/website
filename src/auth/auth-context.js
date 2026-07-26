import { createContext } from 'react';

/**
 * @typedef {{
 *   authenticated: boolean,
 *   subject: string,
 *   displayName?: string,
 *   email?: string,
 *   preferredUsername?: string,
 *   entitlements?: string[]
 * }} AuthUser
 */

/**
 * @typedef {{
 *   status: 'loading' | 'anonymous' | 'authenticated',
 *   user: AuthUser | null,
 *   refresh: (signal?: AbortSignal) => Promise<AuthUser | null>,
 *   logout: () => Promise<{ redirect?: string }>
 * }} AuthValue
 */

/** @type {import('react').Context<AuthValue | null>} */
export const AuthContext = createContext(/** @type {AuthValue | null} */ (null));
