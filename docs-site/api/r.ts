import fs from 'fs';
import path from 'path';

import type { VercelRequest, VercelResponse } from '@vercel/node';

const SPECIAL_FILES = ['index.json', 'registry.json', 'versions.json'];

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

function getVersionInfo(basePath: string): any {
  try {
    const versionsPath = path.join(basePath, 'versions.json');
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

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Extract file path from query parameter (from rewrite /r/:path* -> /api/r?file=:path*)
  const { file } = req.query;
  const fileName = Array.isArray(file) ? file.join('/') : file || '';

  if (!fileName) {
    return res.status(400).json({ error: 'Bad Request', message: 'File path required' });
  }

  const basePath = getBasePath();
  const versionInfo = getVersionInfo(basePath);

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
    const majorData = versionInfo as any;
    versionPath = majorData.majorVersions?.[versionParam]?.path || versionInfo.currentPath;
  } else {
    // Just version number (e.g., '1.0.0-beta.5') - find the major and construct path
    const versionData = (versionInfo as any).versions?.[versionParam];
    if (versionData) {
      versionPath = `v${versionData.major}/${versionParam}`;
    } else {
      versionPath = versionInfo.currentPath;
    }
  }

  const baseDir = path.resolve(basePath, versionPath);
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
    message: `Component "${fileName}" does not exist in version "${versionPath}"`,
    hint: 'Check available versions or component name',
  });
}
