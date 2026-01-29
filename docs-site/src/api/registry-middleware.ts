import fs from 'fs';
import path from 'path';

import type { Plugin } from 'vite';

const SPECIAL_FILES = ['index.json', 'registry.json', 'versions.json'];

interface VersionInfo {
  current: string;
  latest: string;
  beta?: string;
  stable?: string | null;
  majorVersions?: Record<string, { latest: string; stable: string | null; beta: string }>;
  versions?: Record<string, { status: string; major: string }>;
}

function getVersionPath(version: string, versionInfo: VersionInfo): string {
  const versionData = versionInfo.versions?.[version];
  if (versionData) {
    return `v${versionData.major}/${version}`;
  }
  // Fallback: assume v1
  return `v1/${version}`;
}

function getVersionInfo(): VersionInfo {
  try {
    const versionsPath = path.join(process.cwd(), 'public', 'r', 'versions.json');
    if (fs.existsSync(versionsPath)) {
      return JSON.parse(fs.readFileSync(versionsPath, 'utf-8'));
    }
  } catch (error) {
    console.error('Failed to read versions.json:', error);
  }
  // Fallback
  return {
    current: '1.0.0-beta.6',
    latest: '1.0.0-beta.6',
    versions: {
      '1.0.0-beta.6': { status: 'beta', major: '1' },
    },
  };
}

export function registryMiddleware(): Plugin {
  return {
    name: 'registry-version-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/r/')) {
          return next();
        }

        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const fileName = url.pathname.replace(/^\/r\//, '');

        // Special files are served directly without versioning
        if (SPECIAL_FILES.includes(fileName)) {
          return next();
        }

        // Security: Prevent path traversal
        const normalizedFileName = path.normalize(fileName).replace(/^(\.\.([\\/]|$))+/, '');

        if (normalizedFileName !== fileName || normalizedFileName.includes('..')) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Invalid file path' }));
          return;
        }

        const versionInfo = getVersionInfo();
        const versionParam = url.searchParams.get('version');
        let versionPath: string;

        if (!versionParam) {
          // Default to current version
          versionPath = getVersionPath(versionInfo.current, versionInfo);
        } else if (versionParam === 'latest') {
          // Use latest version
          versionPath = getVersionPath(versionInfo.latest, versionInfo);
        } else if (versionParam.startsWith('v') && versionParam.includes('/')) {
          // Full version path provided (e.g., 'v1/1.0.0-beta.5')
          versionPath = versionParam;
        } else if (versionParam.startsWith('v') && !versionParam.includes('/')) {
          // Major version only (e.g., 'v1') - get latest for that major
          const majorVersion = versionInfo.majorVersions?.[versionParam]?.latest;
          versionPath = majorVersion
            ? getVersionPath(majorVersion, versionInfo)
            : getVersionPath(versionInfo.current, versionInfo);
        } else {
          // Just version number (e.g., '1.0.0-beta.5')
          versionPath = getVersionPath(versionParam, versionInfo);
        }

        const baseDir = path.resolve(process.cwd(), 'public', 'r', versionPath);
        const versionedPath = path.resolve(baseDir, normalizedFileName);

        // Security: Ensure resolved path is within base directory
        if (!versionedPath.startsWith(baseDir + path.sep) && versionedPath !== baseDir) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Access denied' }));
          return;
        }

        if (fs.existsSync(versionedPath)) {
          try {
            // nosemgrep: express-fs-filename
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
              message: `Component "${fileName}" does not exist in version "${versionPath}"`,
              hint: 'Check available versions or component name',
            }),
          );
        }
      });
    },
  };
}
