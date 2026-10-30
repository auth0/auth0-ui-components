/**
 * Coordinates token requests from components that mount together, so they stop spending the same
 * refresh token at the same time.
 * @module token-coordination
 * @internal
 */

import type {
  AccessTokenDetails,
  FetcherAuthParams,
  GetAccessTokenSilentlyFunction,
} from '../auth/auth-types';

import { TOKEN_QUEUE_HOLD_MS, tokenQueue, waitFor } from './token-queue';

/** How long a waiting request lets its leader start before it goes out anyway. */
const LEADER_START_WAIT_MS = 10_000;

/**
 * Builds the function the SDK fetcher uses to get an access token. A token that is already cached is
 * returned right away. Only a request that needs a refresh waits in the shared queue, so refreshes
 * for different APIs run one after the other.
 * @param getAccessTokenSilently - The auth context's token function
 * @returns Function that returns the detailed token response for the requested audience and scope
 * @internal
 */
export function createCoordinatedTokenGetter(
  getAccessTokenSilently: GetAccessTokenSilentlyFunction,
) {
  return async (authParams?: FetcherAuthParams): Promise<AccessTokenDetails> => {
    const options = {
      authorizationParams: {
        audience: authParams?.audience,
        scope: authParams?.scope?.join(' '),
      },
      detailedResponse: true,
    } as const;

    const cached = await getAccessTokenSilently({ ...options, cacheMode: 'cache-only' });
    if (cached) return cached;

    const token = await tokenQueue.run(() => getAccessTokenSilently(options));
    if (!token) throw new Error('No access token was returned.');
    return token;
  };
}

interface PendingRequest {
  audience: string;
  scope: string[];
  signal?: AbortSignal | null;
  send: (scope: string[]) => Promise<Response>;
  resolve: (response: Response) => void;
  reject: (reason: unknown) => void;
}

let pending: PendingRequest[] = [];

/**
 * Merges scope lists, keeping each scope once in the order it first appears.
 * @param scopes - Scope lists to merge
 * @returns The merged scopes
 * @internal
 */
const union = (scopes: string[][]): string[] => [...new Set(scopes.flat())];

/**
 * Sends a waiting request unless its caller aborted it, and hands the outcome to the caller.
 * @param request - The waiting request
 * @param scope - Scope to send it with
 * @returns Promise that settles when the request has been answered; it never rejects
 * @internal
 */
async function sendUnlessAborted(request: PendingRequest, scope: string[]): Promise<void> {
  if (request.signal?.aborted) {
    request.reject(request.signal.reason ?? new DOMException('Aborted', 'AbortError'));
    return;
  }
  try {
    request.resolve(await request.send(scope));
  } catch (error) {
    request.reject(error);
  }
}

/**
 * Sends the first request of a group with the scopes of the whole group, in its turn in the queue,
 * then sends the rest with their own scope once it has been answered.
 * @param group - Requests for the same API that arrived together
 * @internal
 */
function warmGroup(group: PendingRequest[]): void {
  const [leader, ...followers] = group;
  if (!leader) return;

  let markStarted: () => void = () => undefined;
  const started = new Promise<void>((resolve) => {
    markStarted = resolve;
  });

  const leaderDone = tokenQueue.run(() => {
    markStarted();
    return sendUnlessAborted(leader, union(group.map((request) => request.scope)));
  });

  followers.forEach((follower) => {
    void waitFor(started, LEADER_START_WAIT_MS)
      .then(() => waitFor(leaderDone, TOKEN_QUEUE_HOLD_MS))
      .then(() => sendUnlessAborted(follower, follower.scope));
  });
}

/**
 * Groups the requests collected in this tick by API and starts each group.
 * @internal
 */
function flush(): void {
  const batch = pending;
  pending = [];

  const groups = new Map<string, PendingRequest[]>();
  batch.forEach((request) => {
    groups.set(request.audience, [...(groups.get(request.audience) ?? []), request]);
  });
  groups.forEach(warmGroup);
}

/**
 * Sends a request through a server-side proxy, which refreshes the session's tokens itself. Requests
 * that arrive in the same tick are grouped by API: the first request of each group goes out first, with
 * the scopes of the whole group, and takes its turn in the shared queue. The others wait for its
 * response, which carries the updated session, and then go out with their own scope.
 * @param authParams - Audience and scope of the request
 * @param init - Request options, used to honor an abort signal while the request waits
 * @param send - Sends the request with the given scope
 * @returns The response of this request
 * @internal
 */
export function coordinateProxyRequest(
  authParams: FetcherAuthParams | undefined,
  init: RequestInit | undefined,
  send: (scope: string[] | undefined) => Promise<Response>,
): Promise<Response> {
  const audience = authParams?.audience;
  const scope = authParams?.scope;
  if (!audience || !scope?.length) return send(scope);

  return new Promise<Response>((resolve, reject) => {
    pending.push({ audience, scope, signal: init?.signal, send, resolve, reject });
    if (pending.length === 1) setTimeout(flush, 0);
  });
}
