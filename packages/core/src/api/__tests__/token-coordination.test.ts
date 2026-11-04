import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AccessTokenDetails } from '../../auth/auth-types';
import type * as TokenCoordinationModule from '../token-coordination';
import { TOKEN_QUEUE_HOLD_MS } from '../token-queue';

import { createDeferred, type Deferred } from './__mocks__/deferred';

const ACCOUNT_API = 'https://tenant.example.com/me/';
const ORG_API = 'https://tenant.example.com/my-org/';

const details = (token: string): AccessTokenDetails => ({
  access_token: token,
  token_type: 'Bearer',
});

type TokenCoordination = typeof TokenCoordinationModule;

describe('token-coordination', () => {
  let coordinateProxyRequest: TokenCoordination['coordinateProxyRequest'];
  let createCoordinatedTokenGetter: TokenCoordination['createCoordinatedTokenGetter'];

  // The queue and the pending requests are module state, so each test starts from a fresh copy.
  beforeEach(async () => {
    vi.resetModules();
    ({ coordinateProxyRequest, createCoordinatedTokenGetter } = await import(
      '../token-coordination'
    ));
  });

  describe('createCoordinatedTokenGetter', () => {
    it('returns a cached token without waiting in the queue', async () => {
      const getAccessTokenSilently = vi.fn().mockResolvedValueOnce(details('cached'));
      const getToken = createCoordinatedTokenGetter(getAccessTokenSilently);

      await expect(getToken({ audience: ACCOUNT_API, scope: ['a', 'b'] })).resolves.toEqual(
        details('cached'),
      );

      expect(getAccessTokenSilently).toHaveBeenCalledTimes(1);
      expect(getAccessTokenSilently).toHaveBeenCalledWith({
        authorizationParams: { audience: ACCOUNT_API, scope: 'a b' },
        detailedResponse: true,
        cacheMode: 'cache-only',
      });
    });

    it('asks for a fresh token when nothing is cached', async () => {
      const getAccessTokenSilently = vi
        .fn()
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(details('fresh'));
      const getToken = createCoordinatedTokenGetter(getAccessTokenSilently);

      await expect(
        getToken({ audience: ORG_API, scope: ['read:my_org:details'] }),
      ).resolves.toEqual(details('fresh'));

      expect(getAccessTokenSilently).toHaveBeenLastCalledWith({
        authorizationParams: { audience: ORG_API, scope: 'read:my_org:details' },
        detailedResponse: true,
      });
    });

    it('refreshes for different APIs one at a time', async () => {
      const refreshes: Deferred<AccessTokenDetails>[] = [];
      let inFlight = 0;
      let peak = 0;
      const getAccessTokenSilently = vi.fn(async (options: { cacheMode?: string }) => {
        if (options.cacheMode === 'cache-only') return undefined;
        inFlight += 1;
        peak = Math.max(peak, inFlight);
        const refresh = createDeferred<AccessTokenDetails>();
        refreshes.push(refresh);
        try {
          return await refresh.promise;
        } finally {
          inFlight -= 1;
        }
      });
      const getToken = createCoordinatedTokenGetter(getAccessTokenSilently);

      const account = getToken({ audience: ACCOUNT_API, scope: ['read:me:organizations'] });
      const org = getToken({ audience: ORG_API, scope: ['read:my_org:details'] });

      await vi.waitFor(() => expect(refreshes).toHaveLength(1));
      refreshes[0]!.resolve(details('account'));
      await vi.waitFor(() => expect(refreshes).toHaveLength(2));
      refreshes[1]!.resolve(details('org'));

      await expect(account).resolves.toEqual(details('account'));
      await expect(org).resolves.toEqual(details('org'));
      expect(peak).toBe(1);
    });

    it('fails when no token is returned', async () => {
      const getToken = createCoordinatedTokenGetter(vi.fn().mockResolvedValue(undefined));

      await expect(getToken({ audience: ORG_API, scope: ['x'] })).rejects.toThrow(
        'No access token was returned.',
      );
    });

    it('does not block the next request after a failed refresh', async () => {
      const getAccessTokenSilently = vi
        .fn()
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('invalid_grant'))
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(details('next'));
      const getToken = createCoordinatedTokenGetter(getAccessTokenSilently);

      await expect(getToken({ audience: ORG_API, scope: ['x'] })).rejects.toThrow('invalid_grant');
      await expect(getToken({ audience: ACCOUNT_API, scope: ['y'] })).resolves.toEqual(
        details('next'),
      );
    });
  });

  describe('coordinateProxyRequest', () => {
    interface SentRequest {
      name: string;
      scope: string[] | undefined;
      response: Deferred<Response>;
    }

    let sent: SentRequest[];

    const request = (
      name: string,
      authParams: { audience?: string; scope?: string[] } | undefined,
      init?: RequestInit,
    ) =>
      coordinateProxyRequest(authParams, init, (scope) => {
        const response = createDeferred<Response>();
        sent.push({ name, scope, response });
        return response.promise;
      });

    const sentNames = () => sent.map((entry) => entry.name);
    const scopeOf = (name: string) => sent.find((entry) => entry.name === name)?.scope;
    const respond = (name: string) => {
      const entry = sent.find((candidate) => candidate.name === name);
      entry!.response.resolve(new Response(name));
    };
    const flushTick = () => vi.advanceTimersByTimeAsync(0);

    beforeEach(() => {
      sent = [];
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('sends a request without an audience or scope straight away', async () => {
      void request('plain', undefined);
      void request('no-scope', { audience: ORG_API });

      expect(sentNames()).toEqual(['plain', 'no-scope']);
    });

    it('sends the first request of each API with the whole group scope, one API at a time', async () => {
      const page = [
        request('account-1', { audience: ACCOUNT_API, scope: ['read:me:organizations'] }),
        request('account-2', { audience: ACCOUNT_API, scope: ['read:me:factors'] }),
        request('org-1', { audience: ORG_API, scope: ['read:my_org:details'] }),
        request('org-2', { audience: ORG_API, scope: ['read:my_org:domains'] }),
      ];

      expect(sentNames()).toEqual([]);

      await flushTick();
      expect(sentNames()).toEqual(['account-1']);
      expect(sent[0]!.scope).toEqual(['read:me:organizations', 'read:me:factors']);

      respond('account-1');
      await flushTick();
      expect(sentNames().slice(0, 1)).toEqual(['account-1']);
      expect(sentNames().slice(1).sort()).toEqual(['account-2', 'org-1']);
      expect(scopeOf('account-2')).toEqual(['read:me:factors']);
      expect(scopeOf('org-1')).toEqual(['read:my_org:details', 'read:my_org:domains']);

      respond('org-1');
      await flushTick();
      expect(sentNames()).toHaveLength(4);
      expect(scopeOf('org-2')).toEqual(['read:my_org:domains']);

      respond('account-2');
      respond('org-2');
      const responses = await Promise.all(page);
      expect(await Promise.all(responses.map((response) => response.text()))).toEqual([
        'account-1',
        'account-2',
        'org-1',
        'org-2',
      ]);
    });

    it('keeps each scope once, in the order it first appears', async () => {
      const first = request('first', { audience: ORG_API, scope: ['a', 'b'] });
      const second = request('second', { audience: ORG_API, scope: ['b', 'c'] });

      await flushTick();
      expect(sent[0]!.scope).toEqual(['a', 'b', 'c']);

      respond('first');
      await flushTick();
      respond('second');
      await Promise.all([first, second]);
    });

    it('treats requests from a later tick as a new group', async () => {
      const first = request('first', { audience: ORG_API, scope: ['a'] });
      await flushTick();
      respond('first');
      await first;

      const second = request('second', { audience: ORG_API, scope: ['b'] });
      await flushTick();

      expect(scopeOf('second')).toEqual(['b']);
      respond('second');
      await second;
    });

    it('gives a failing leader its error and still sends the waiting requests', async () => {
      const leader = request('leader', { audience: ORG_API, scope: ['a'] });
      const follower = request('follower', { audience: ORG_API, scope: ['b'] });
      const leaderResult = leader.catch((error: Error) => error.message);

      await flushTick();
      sent[0]!.response.reject(new Error('invalid_grant'));
      await flushTick();

      await expect(leaderResult).resolves.toBe('invalid_grant');
      expect(sentNames()).toEqual(['leader', 'follower']);
      respond('follower');
      await expect(follower).resolves.toBeInstanceOf(Response);
    });

    describe('when the first request of a group fails', () => {
      const group = () => {
        const leader = request('leader', { audience: ORG_API, scope: ['a'] });
        void leader.catch(() => undefined);
        const first = request('first', { audience: ORG_API, scope: ['b'] });
        const second = request('second', { audience: ORG_API, scope: ['c'] });
        return { leader, first, second };
      };

      it('lets the next request lead the rest, instead of sending them all together', async () => {
        const { first, second } = group();

        await flushTick();
        sent[0]!.response.reject(new Error('network error'));
        await flushTick();

        expect(sentNames()).toEqual(['leader', 'first']);
        expect(scopeOf('first')).toEqual(['b', 'c']);

        respond('first');
        await flushTick();
        expect(sentNames()).toEqual(['leader', 'first', 'second']);
        expect(scopeOf('second')).toEqual(['c']);
        respond('second');
        await Promise.all([first, second]);
      });

      it('does the same when the response is a server error', async () => {
        const { first, second } = group();

        await flushTick();
        sent[0]!.response.resolve(new Response('unavailable', { status: 503 }));
        await flushTick();

        expect(sentNames()).toEqual(['leader', 'first']);
        respond('first');
        await flushTick();
        respond('second');
        await Promise.all([first, second]);
      });

      it('sends the rest together when the response is an API error, since the session was refreshed', async () => {
        const { first, second } = group();

        await flushTick();
        sent[0]!.response.resolve(new Response('forbidden', { status: 403 }));
        await flushTick();

        expect(sentNames()).toEqual(['leader', 'first', 'second']);
        expect(scopeOf('first')).toEqual(['b']);
        respond('first');
        respond('second');
        await Promise.all([first, second]);
      });

      it('lets the next request lead when the first was aborted before it was sent', async () => {
        const controller = new AbortController();
        const leader = request(
          'leader',
          { audience: ORG_API, scope: ['a'] },
          { signal: controller.signal },
        );
        void leader.catch(() => undefined);
        const first = request('first', { audience: ORG_API, scope: ['b'] });
        const second = request('second', { audience: ORG_API, scope: ['c'] });

        controller.abort();
        await flushTick();

        expect(sentNames()).toEqual(['first']);
        expect(scopeOf('first')).toEqual(['b', 'c']);
        respond('first');
        await flushTick();
        respond('second');
        await Promise.all([first, second]);
      });
    });

    it('gives the caller the error when the send function throws straight away', async () => {
      const failing = coordinateProxyRequest({ audience: ORG_API, scope: ['a'] }, undefined, () => {
        throw new Error('cannot send');
      });
      const follower = request('follower', { audience: ORG_API, scope: ['b'] });
      const failingResult = failing.catch((error: Error) => error.message);

      await flushTick();

      await expect(failingResult).resolves.toBe('cannot send');
      await flushTick();
      expect(sentNames()).toEqual(['follower']);
      respond('follower');
      await expect(follower).resolves.toBeInstanceOf(Response);
    });

    it('does not send a request that was aborted while waiting', async () => {
      const controller = new AbortController();
      const leader = request('leader', { audience: ORG_API, scope: ['a'] });
      const follower = request(
        'follower',
        { audience: ORG_API, scope: ['b'] },
        {
          signal: controller.signal,
        },
      );
      const followerResult = follower.catch((error: unknown) => error);

      await flushTick();
      controller.abort();
      respond('leader');
      await flushTick();

      expect(sentNames()).toEqual(['leader']);
      expect(await followerResult).toBeInstanceOf(DOMException);
      await leader;
    });

    it('rejects a waiting request as soon as it is aborted, before its leader answers', async () => {
      const controller = new AbortController();
      const leader = request('leader', { audience: ORG_API, scope: ['a'] });
      const follower = request(
        'follower',
        { audience: ORG_API, scope: ['b'] },
        {
          signal: controller.signal,
        },
      );
      const settled = vi.fn();
      void follower.then(settled, settled);

      await flushTick();
      controller.abort();
      await flushTick();

      expect(settled).toHaveBeenCalledWith(expect.any(DOMException));
      expect(sentNames()).toEqual(['leader']);

      respond('leader');
      await flushTick();
      expect(sentNames()).toEqual(['leader']);
      await leader;
    });

    it('rejects a request that is already aborted without queueing it', async () => {
      const controller = new AbortController();
      controller.abort(new Error('unmounted'));

      await expect(
        request('aborted', { audience: ORG_API, scope: ['a'] }, { signal: controller.signal }),
      ).rejects.toThrow('unmounted');

      await flushTick();
      expect(sentNames()).toEqual([]);
    });

    it('stops listening for an abort once the request has settled', async () => {
      const controller = new AbortController();
      const removeEventListener = vi.spyOn(controller.signal, 'removeEventListener');
      const only = request(
        'only',
        { audience: ORG_API, scope: ['a'] },
        { signal: controller.signal },
      );

      await flushTick();
      respond('only');
      await only;

      expect(removeEventListener).toHaveBeenCalledWith('abort', expect.any(Function));
    });

    it('sends the waiting requests when the first one never answers', async () => {
      void request('leader', { audience: ORG_API, scope: ['a'] });
      const follower = request('follower', { audience: ORG_API, scope: ['b'] });

      await flushTick();
      expect(sentNames()).toEqual(['leader']);

      await vi.advanceTimersByTimeAsync(TOKEN_QUEUE_HOLD_MS);
      expect(sentNames()).toEqual(['leader', 'follower']);
      respond('follower');
      await follower;
    });
  });
});
