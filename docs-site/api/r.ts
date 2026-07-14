import fs from 'fs';
import path from 'path';

import type { VercelRequest, VercelResponse } from '@vercel/node';

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 60;
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function pruneExpiredRateLimitEntries(now: number): void {
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  pruneExpiredRateLimitEntries(now);
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

function getBasePath(): string {
  const paths = [
    path.join(process.cwd(), 'dist', 'r'),
    path.join(process.cwd(), 'r'),
    path.join(process.cwd(), 'docs-site', 'dist', 'r'),
    path.join(process.cwd(), 'docs-site', 'public', 'r'),
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return paths[0]!;
}

function getVersionInfo(basePath: string): VersionInfo {
  const versionsPath = path.join(basePath, 'versions.json');
  if (!fs.existsSync(versionsPath)) {
    throw new Error('versions.json not found. Run the build to generate it.');
  }
  try {
    return JSON.parse(fs.readFileSync(versionsPath, 'utf-8'));
  } catch (error) {
    throw new Error(`Failed to parse versions.json: ${error}`);
  }
}

function sendJson(res: VercelResponse, content: string): void {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('Deprecation', 'true');
  res.setHeader('Sunset', 'Sat, 31 Dec 2026 23:59:59 GMT');
  res.setHeader('Link', '<https://github.com/auth0/auth0-ui-components>; rel="successor-version"');
  res.send(content);
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too Many Requests', message: 'Rate limit exceeded' });
  }

  const { file } = req.query;
  const fileName = Array.isArray(file) ? file.join('/') : file || '';

  if (!fileName) {
    return res.status(400).json({ error: 'Bad Request', message: 'File path required' });
  }

  const normalizedFileName = path.normalize(fileName).replace(/^(\.\.([\\/]|$))+/, '');
  if (normalizedFileName !== fileName || normalizedFileName.includes('..')) {
    return res.status(400).json({ error: 'Invalid file path' });
  }

  const basePath = getBasePath();
  const versionInfo = getVersionInfo(basePath);
  const rawVersionParam = req.query.version;
  const versionParam = typeof rawVersionParam === 'string' ? rawVersionParam : undefined;

  const rootFilePath = path.join(basePath, normalizedFileName);
  if (!versionParam && fs.existsSync(rootFilePath)) {
    try {
      sendJson(res, fs.readFileSync(rootFilePath, 'utf-8'));
    } catch (error) {
      console.error('Failed to read registry file: %s', rootFilePath);
      res
        .status(500)
        .json({ error: 'Internal Server Error', message: 'Failed to read registry file' });
    }
    return;
  }

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
    return res.status(400).json({ error: 'Invalid version' });
  }

  const baseDir = path.resolve(basePath, versionPath);
  if (!baseDir.startsWith(basePath + path.sep) && baseDir !== basePath) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const versionedPath = path.resolve(baseDir, normalizedFileName);
  if (!versionedPath.startsWith(baseDir + path.sep) && versionedPath !== baseDir) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (fs.existsSync(versionedPath)) {
    try {
      sendJson(res, fs.readFileSync(versionedPath, 'utf-8'));
    } catch (error) {
      console.error('Failed to read registry file: %s', versionedPath);
      res
        .status(500)
        .json({ error: 'Internal Server Error', message: 'Failed to read registry file' });
    }
    return;
  }

  return res.status(404).json({
    error: 'Not Found',
    message: `Component "${normalizedFileName}" does not exist in version "${versionPath}"`,
    hint: 'Check available versions or component name',
  });
}
