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
    if (!token) {
      const { audience, scope } = options.authorizationParams;
      throw new Error(
        `No access token was returned (audience: ${audience ?? 'default'}, scope: ${scope ?? 'default'}).`,
      );
    }
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
 * Returns what an aborted request rejects with, matching `fetch`.
 * @param signal - The aborted signal
 * @returns The signal's reason, or an `AbortError`
 * @internal
 */
const abortReason = (signal: AbortSignal): unknown =>
  signal.reason ?? new DOMException('Aborted', 'AbortError');

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
 * @returns Promise that settles when the request has been answered, with whether it was answered
 * without a failure (not aborted, not rejected, no server error); it never rejects
 * @internal
 */
async function sendUnlessAborted(request: PendingRequest, scope: string[]): Promise<boolean> {
  if (request.signal?.aborted) {
    request.reject(abortReason(request.signal));
    return false;
  }
  try {
    const response = await request.send(scope);
    request.resolve(response);
    return response.status < 500;
  } catch (error) {
    request.reject(error);
    return false;
  }
}

/**
 * Sends the first request of a group with the scopes of the whole group, in its turn in the queue,
 * then sends the rest with their own scope once it has been answered. If the first request fails,
 * the session was not refreshed, so the next request leads the rest instead of all of them going out
 * together. The rest also go out when the first one does not start or answer in time.
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

  if (followers.length === 0) return;

  void waitFor(started, LEADER_START_WAIT_MS)
    .then(() => waitFor(leaderDone, TOKEN_QUEUE_HOLD_MS))
    .then((leaderSucceeded) => {
      if (leaderSucceeded === false) {
        warmGroup(followers);
        return;
      }
      followers.forEach((follower) => void sendUnlessAborted(follower, follower.scope));
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

  const signal = init?.signal;
  if (signal?.aborted) return Promise.reject(abortReason(signal));

  return new Promise<Response>((resolve, reject) => {
    // Like `fetch`, reject as soon as the caller aborts, even while the request is still waiting.
    const onAbort = () => reject(abortReason(signal!));
    signal?.addEventListener('abort', onAbort, { once: true });
    const settle =
      <T>(done: (value: T) => void) =>
      (value: T) => {
        signal?.removeEventListener('abort', onAbort);
        done(value);
      };

    pending.push({
      audience,
      scope,
      signal,
      send,
      resolve: settle(resolve),
      reject: settle(reject),
    });
    if (pending.length === 1) setTimeout(flush, 0);
  });
}
