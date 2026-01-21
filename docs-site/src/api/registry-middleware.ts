import fs from 'fs';
import path from 'path';

import type { Plugin } from 'vite';

const SPECIAL_FILES = ['index.json', 'registry.json', 'versions.json'];
const DEFAULT_VERSION = 'v1';
const LATEST_VERSION = 'v1';

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

        const versionParam = url.searchParams.get('version');
        let version = versionParam || DEFAULT_VERSION;

        if (version === 'latest') {
          version = LATEST_VERSION;
        }

        const versionedPath = path.join(process.cwd(), 'public', 'r', version, fileName);

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
              message: `Component "${fileName}" does not exist in version "${version}"`,
              hint: 'Check available versions or component name',
            }),
          );
        }
      });
    },
  };
}
