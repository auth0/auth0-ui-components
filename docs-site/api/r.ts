import fs from 'fs';
import path from 'path';

import type { VercelRequest, VercelResponse } from '@vercel/node';

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
  try {
    const versionsPath = path.join(basePath, 'versions.json');
    if (fs.existsSync(versionsPath)) {
      return JSON.parse(fs.readFileSync(versionsPath, 'utf-8'));
    }
  } catch (error) {
    console.error('Failed to read versions.json:', error);
  }
  return {
    current: '1.0.0-beta.6',
    latest: '1.0.0-beta.6',
    versions: {
      '1.0.0-beta.6': { status: 'beta', major: '1' },
    },
  };
}

function sendJson(res: VercelResponse, content: string): void {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(content);
}

export default function handler(req: VercelRequest, res: VercelResponse) {
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

  const rootFilePath = path.join(basePath, normalizedFileName);
  if (fs.existsSync(rootFilePath)) {
    try {
      sendJson(res, fs.readFileSync(rootFilePath, 'utf-8'));
    } catch (error) {
      console.error(`Failed to read registry file ${rootFilePath}:`, error);
      res
        .status(500)
        .json({ error: 'Internal Server Error', message: 'Failed to read registry file' });
    }
    return;
  }

  const versionParam = req.query.version as string | undefined;
  let versionPath: string;

  if (!versionParam) {
    versionPath = getVersionPath(versionInfo.current, versionInfo);
  } else if (versionParam === 'latest') {
    versionPath = getVersionPath(versionInfo.latest, versionInfo);
  } else if (versionParam.startsWith('v') && versionParam.includes('/')) {
    versionPath = versionParam;
  } else if (versionParam.startsWith('v') && !versionParam.includes('/')) {
    const majorVersion = versionInfo.majorVersions?.[versionParam]?.latest;
    versionPath = majorVersion
      ? getVersionPath(majorVersion, versionInfo)
      : getVersionPath(versionInfo.current, versionInfo);
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
      console.error(`Failed to read registry file ${versionedPath}:`, error);
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
