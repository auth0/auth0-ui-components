import fs from 'fs';
import path from 'path';

import type { VercelRequest, VercelResponse } from '@vercel/node';

const SPECIAL_FILES = ['index.json', 'registry.json', 'versions.json'];
const DEFAULT_VERSION = 'v1';
const LATEST_VERSION = 'v2';

function getBasePath(): string {
  // Vercel builds to docs-site/dist, which becomes the outputDirectory
  // In production, cwd is /var/task and files are at /var/task/dist/r
  const paths = [
    path.join(process.cwd(), 'dist', 'r'), // Vercel production (cwd is /var/task)
    path.join(process.cwd(), 'r'), // Alternative
    path.join(process.cwd(), 'docs-site', 'dist', 'r'), // Local after build
    path.join(process.cwd(), 'docs-site', 'public', 'r'), // Local dev
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return paths[0]!; // Fallback
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Extract file path from query parameter (from rewrite /r/:path* -> /api/r?file=:path*)
  const { file } = req.query;
  const fileName = Array.isArray(file) ? file.join('/') : file || '';

  if (!fileName) {
    return res.status(400).json({ error: 'Bad Request', message: 'File path required' });
  }

  const basePath = getBasePath();

  if (SPECIAL_FILES.includes(fileName)) {
    const filePath = path.join(basePath, fileName);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.send(content);
    }
  }

  const normalizedFileName = path.normalize(fileName).replace(/^(\.\.([\\/]|$))+/, '');

  if (normalizedFileName !== fileName || normalizedFileName.includes('..')) {
    return res.status(400).json({ error: 'Invalid file path' });
  }

  const versionParam = req.query.version as string | undefined;
  let version = versionParam || DEFAULT_VERSION;

  if (version === 'latest') {
    version = LATEST_VERSION;
  }

  const baseDir = path.resolve(basePath, version);
  const versionedPath = path.resolve(baseDir, normalizedFileName);

  if (!versionedPath.startsWith(baseDir + path.sep) && versionedPath !== baseDir) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (fs.existsSync(versionedPath)) {
    const content = fs.readFileSync(versionedPath, 'utf-8');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(content);
  }

  return res.status(404).json({
    error: 'Not Found',
    message: `Component "${fileName}" does not exist in version "${version}"`,
    hint: 'Check available versions or component name',
  });
}
