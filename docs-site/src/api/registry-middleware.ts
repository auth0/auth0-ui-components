import fs from 'fs';
import path from 'path';

import type { Plugin } from 'vite';

const SPECIAL_FILES = ['index.json', 'registry.json', 'versions.json'];

function getVersionInfo(): any {
  try {
    const versionsPath = path.join(process.cwd(), 'public', 'r', 'versions.json');
    if (fs.existsSync(versionsPath)) {
      const versionsData = JSON.parse(fs.readFileSync(versionsPath, 'utf-8'));
      return {
        ...versionsData,
        currentPath: versionsData.currentPath || versionsData.current || 'v1',
        latestPath: versionsData.latestPath || versionsData.latest || 'v1',
      };
    }
  } catch (error) {
    console.error('Failed to read versions.json:', error);
  }
  // Fallback - minimal defaults without hardcoded versions
  return {
    current: 'v1',
    latest: 'v1',
    currentPath: 'v1',
    latestPath: 'v1',
    majorVersions: {},
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

        const versionInfo = getVersionInfo();
        const versionParam = url.searchParams.get('version');
        let versionPath: string;

        if (!versionParam) {
          versionPath = versionInfo.currentPath;
        } else if (versionParam === 'latest') {
          versionPath = versionInfo.latestPath;
        } else if (versionParam.startsWith('v') && versionParam.includes('/')) {
          // Full version path provided (e.g., 'v1/1.0.0-beta.5')
          versionPath = versionParam;
        } else if (versionParam.startsWith('v') && !versionParam.includes('/')) {
          // Major version only (e.g., 'v1') - get latest for that major
          versionPath = versionInfo.majorVersions?.[versionParam]?.path || versionInfo.currentPath;
        } else {
          // Just version number (e.g., '1.0.0-beta.5') - find the major and construct path
          const versionData = versionInfo.versions?.[versionParam];
          if (versionData) {
            versionPath = `v${versionData.major}/${versionParam}`;
          } else {
            versionPath = versionInfo.currentPath;
          }
        }

        const versionedPath = path.join(process.cwd(), 'public', 'r', versionPath, fileName);

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
              message: `Component "${fileName}" does not exist in version "${versionPath}"`,
              hint: 'Check available versions or component name',
            }),
          );
        }
      });
    },
  };
}
