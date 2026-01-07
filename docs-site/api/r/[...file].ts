import fs from 'fs';
import path from 'path';

import type { VercelRequest, VercelResponse } from '@vercel/node';

const SPECIAL_FILES = ['index.json', 'registry.json', 'versions.json'];
const DEFAULT_VERSION = 'v1';
const LATEST_VERSION = 'v2';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { file } = req.query;
  const fileName = Array.isArray(file) ? file.join('/') : file;

  if (!fileName) {
    return res.status(400).json({ error: 'Bad Request', message: 'File path required' });
  }

  if (SPECIAL_FILES.includes(fileName)) {
    const filePath = path.join(process.cwd(), 'public', 'r', fileName);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.send(content);
    }
  }

  const versionParam = req.query.version as string | undefined;
  let version = versionParam || DEFAULT_VERSION;

  if (version === 'latest') {
    version = LATEST_VERSION;
  }

  const versionedPath = path.join(process.cwd(), 'public', 'r', version, fileName);

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
