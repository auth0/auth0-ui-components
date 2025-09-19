import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth0Config } from '@/config/auth';
import { auth0 } from '@/lib/auth0';

const createErrorResponse = (message: string, status: number, details?: string) => {
  return NextResponse.json(details ? { error: message, details } : { error: message }, { status });
};

const proxyHandler = async (req: NextRequest) => {
  try {
    const path = req.nextUrl.pathname.substring('/api'.length);
    if (path === '/oauth/token') {
      return handleOAuthTokenRequest(req);
    }
    return handleGenericProxyRequest(req, path);
  } catch (error) {
    if (error instanceof Error && error.message.includes('No current session')) {
      return createErrorResponse('Authentication required', 401, 'Please log in again.');
    }
    return createErrorResponse(
      'Internal proxy error',
      500,
      error instanceof Error ? error.message : 'An unknown error occurred.',
    );
  }
};

const handleOAuthTokenRequest = async (req: NextRequest) => {
  try {
    const targetUrl = `${auth0Config.issuerBaseUrl}/oauth/token`;
    const requestBody = req.method === 'POST' ? await req.text() : undefined;
    let bodyToSend = requestBody;

    if (requestBody) {
      const parsedBody = JSON.parse(requestBody);
      if (parsedBody.grant_type === 'http://auth0.com/oauth/grant-type/mfa-otp') {
        const tokenResult = await auth0.getAccessToken();
        if (tokenResult?.token) {
          parsedBody.mfa_token = tokenResult.token;
        }
        parsedBody.client_id = auth0Config.clientId;
        parsedBody.client_secret = auth0Config.clientSecret;
        bodyToSend = JSON.stringify(parsedBody);
      }
    }

    const headers = new Headers(req.headers);
    headers.delete('host');
    headers.delete('cookie');
    headers.delete('Content-Length');

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: bodyToSend,
    });

    const responseData = await response.text();
    return new NextResponse(responseData, {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
    });
  } catch (error) {
    return createErrorResponse(
      'OAuth token proxy error',
      500,
      'An internal error occurred while processing the token request.',
    );
  }
};

const handleGenericProxyRequest = async (req: NextRequest, path: string) => {
  const session = await auth0.getSession();
  if (!session) {
    return createErrorResponse('Not authenticated', 401, 'No user session found.');
  }
  const { token: accessToken } = (await auth0.getAccessToken()) || {};
  if (!accessToken) {
    return createErrorResponse('Unauthorized', 401, 'Failed to obtain a valid access token.');
  }

  const targetUrl = `${auth0Config.issuerBaseUrl}${path}`;
  const headers = new Headers(req.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  headers.delete('host');
  headers.delete('cookie');

  const apiResponse = await fetch(targetUrl, {
    method: req.method,
    headers: headers,
    body: req.body,
    duplex: 'half',
    redirect: 'manual',
  } as RequestInit & { duplex: 'half' });

  const responseHeaders = new Headers(apiResponse.headers);
  responseHeaders.delete('set-cookie');
  responseHeaders.delete('www-authenticate');

  if (apiResponse.status === 204) {
    return new NextResponse(null, { status: 204, headers: responseHeaders });
  }

  return new NextResponse(apiResponse.body, {
    status: apiResponse.status,
    statusText: apiResponse.statusText,
    headers: responseHeaders,
  });
};

export {
  proxyHandler as GET,
  proxyHandler as POST,
  proxyHandler as PUT,
  proxyHandler as PATCH,
  proxyHandler as DELETE,
  proxyHandler as OPTIONS,
};
