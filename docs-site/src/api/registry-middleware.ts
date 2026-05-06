import fs from 'fs';
import path from 'path';

import type { Plugin } from 'vite';

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 60;
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

interface VersionInfo {
  latest: string;
  majorVersions?: Record<string, { latest: string }>;
  versions?: Record<string, { status: string; major: string }>;
}

function getVersionPath(version: string, versionInfo: VersionInfo): string {
  const versionData = versionInfo.versions?.[version];
  if (versionData) {
    return `v${versionData.major}/${version}`;
  }
  return `v1/${version}`;
}

function getVersionInfo(): VersionInfo {
  const versionsPath = path.join(process.cwd(), 'public', 'r', 'versions.json');
  if (!fs.existsSync(versionsPath)) {
    throw new Error('versions.json not found. Run the build to generate it.');
  }
  try {
    return JSON.parse(fs.readFileSync(versionsPath, 'utf-8'));
  } catch (error) {
    throw new Error(`Failed to parse versions.json: ${error}`);
  }
}

export function registryMiddleware(): Plugin {
  return {
    name: 'registry-version-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/r/')) {
          return next();
        }

        const clientIp =
          (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
          req.socket.remoteAddress ||
          'unknown';
        if (isRateLimited(clientIp)) {
          res.statusCode = 429;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Too Many Requests' }));
          return;
        }

        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const fileName = url.pathname.replace(/^\/r\//, '');

        const normalizedFileName = path.normalize(fileName).replace(/^(\.\.([\\/]|$))+/, '');
        if (normalizedFileName !== fileName || normalizedFileName.includes('..')) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Invalid file path' }));
          return;
        }

        const rootFilePath = path.join(process.cwd(), 'public', 'r', normalizedFileName);
        const versionParam = url.searchParams.get('version');
        if (!versionParam && fs.existsSync(rootFilePath)) {
          return next();
        }

        const versionInfo = getVersionInfo();
        let versionPath: string;

        if (!versionParam || versionParam === 'latest') {
          versionPath = getVersionPath(versionInfo.latest, versionInfo);
        } else if (versionParam.startsWith('v') && versionParam.includes('/')) {
          versionPath = versionParam;
        } else if (versionParam.startsWith('v') && !versionParam.includes('/')) {
          const majorVersion = versionInfo.majorVersions?.[versionParam]?.latest;
          versionPath = majorVersion
            ? getVersionPath(majorVersion, versionInfo)
            : getVersionPath(versionInfo.latest, versionInfo);
        } else {
          versionPath = getVersionPath(versionParam, versionInfo);
        }

        const normalizedVersionPath = path.normalize(versionPath);
        if (
          normalizedVersionPath !== versionPath ||
          normalizedVersionPath.includes('..') ||
          path.isAbsolute(normalizedVersionPath)
        ) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Invalid version' }));
          return;
        }

        const registryRoot = path.resolve(process.cwd(), 'public', 'r');
        const baseDir = path.resolve(registryRoot, versionPath);
        if (!baseDir.startsWith(registryRoot + path.sep) && baseDir !== registryRoot) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Access denied' }));
          return;
        }

        const versionedPath = path.resolve(baseDir, normalizedFileName);
        if (!versionedPath.startsWith(baseDir + path.sep) && versionedPath !== baseDir) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Access denied' }));
          return;
        }

        if (fs.existsSync(versionedPath)) {
          try {
            const content = fs.readFileSync(versionedPath, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.end(content);
          } catch (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: 'Internal Server Error',
                message: 'Failed to read registry file',
              }),
            );
          }
        } else {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error: 'Not Found',
              message: `Component "${normalizedFileName}" does not exist in version "${versionPath}"`,
              hint: 'Check available versions or component name',
            }),
          );
        }
      });
    },
  };
}
