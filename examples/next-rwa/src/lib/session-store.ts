import type { SessionData, SessionDataStore } from '@auth0/nextjs-auth0/types';

// Kept on globalThis so a hot reload in development does not sign everyone out.
const sessions = ((globalThis as { __auth0Sessions?: Map<string, SessionData> }).__auth0Sessions ??=
  new Map<string, SessionData>());

/** In-memory session store for the example. Use Redis or a database in production. */
export const sessionStore: SessionDataStore = {
  get: async (id) => sessions.get(id) ?? null,
  set: async (id, session) => {
    sessions.set(id, session);
  },
  delete: async (id) => {
    sessions.delete(id);
  },
};
