#!/usr/bin/env node

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PACKAGES = ['core', 'react'];
const SECTION_BY_TYPE = {
  feat: 'Features',
  fix: 'Bug Fixes',
  perf: 'Performance',
  refactor: 'Refactoring',
  docs: 'Documentation',
};
const HIDE_LABEL = 'self-bump';
const SECTION_ORDER = [...Object.values(SECTION_BY_TYPE), 'Other'];
const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;
const REF_PATTERN = /^[\w./@^~-]+$/;
const NPM_TAG_PATTERN = /^[a-zA-Z0-9._-]+$/;

function fail(message) {
  console.error(message);
  process.exit(1);
}

function run(command, args) {
  return execFileSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function readPackage(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'packages', name, 'package.json'), 'utf8'));
}

function changelogPath(name) {
  return path.join(ROOT, 'packages', name, 'CHANGELOG.md');
}

function operand(value, flag) {
  if (value === undefined || value.startsWith('-')) fail(`${flag} expects a value`);
  return value;
}

function parseArgs(argv) {
  const args = { exclude: [], dryRun: false, to: 'HEAD' };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--exclude') {
      const value = argv[++i];
      if (!/^\d+$/.test(value ?? '')) fail(`--exclude expects a PR number, got "${value}"`);
      args.exclude.push(Number(value));
    } else if (arg === '--version') {
      args.version = operand(argv[++i], arg);
    } else if (arg === '--from') {
      args.from = operand(argv[++i], arg);
    } else if (arg === '--to') {
      args.to = operand(argv[++i], arg);
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--release-body') {
      args.releaseBody = { pkg: argv[++i], version: argv[++i], npmTag: argv[++i] };
    } else {
      fail(`Unknown argument: ${arg}`);
    }
  }
  for (const ref of [args.from, args.to]) {
    if (ref !== undefined && !REF_PATTERN.test(ref)) fail(`Invalid git ref: ${ref}`);
  }
  if (args.version !== undefined && !VERSION_PATTERN.test(args.version)) {
    fail(`Invalid version: ${args.version}`);
  }
  if (args.releaseBody) {
    const { pkg, version, npmTag } = args.releaseBody;
    if (!PACKAGES.includes(pkg)) fail(`--release-body package must be one of ${PACKAGES}`);
    if (!VERSION_PATTERN.test(version ?? '')) fail(`Invalid version: ${version}`);
    if (!NPM_TAG_PATTERN.test(npmTag ?? '')) fail(`Invalid npm tag: ${npmTag}`);
  }
  return args;
}

function parseVersion(text) {
  const match = VERSION_PATTERN.exec(text);
  if (!match) return null;
  return {
    core: [Number(match[1]), Number(match[2]), Number(match[3])],
    pre: match[4] ? match[4].split('.') : [],
  };
}

function compareVersions(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a.core[i] !== b.core[i]) return a.core[i] - b.core[i];
  }
  if (!a.pre.length || !b.pre.length) return b.pre.length - a.pre.length;
  for (let i = 0; i < Math.max(a.pre.length, b.pre.length); i++) {
    const x = a.pre[i];
    const y = b.pre[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    const xNumeric = /^\d+$/.test(x);
    const yNumeric = /^\d+$/.test(y);
    if (xNumeric && yNumeric) {
      if (Number(x) !== Number(y)) return Number(x) - Number(y);
    } else if (xNumeric) {
      return -1;
    } else if (yNumeric) {
      return 1;
    } else if (x !== y) {
      return x < y ? -1 : 1;
    }
  }
  return 0;
}

function findPreviousTag(version) {
  const current = parseVersion(version);
  const candidates = run('git', ['tag', '--list', 'v*'])
    .split('\n')
    .filter(Boolean)
    .map((tag) => ({ tag, parsed: parseVersion(tag.slice(1)) }))
    .filter((candidate) => candidate.parsed && compareVersions(candidate.parsed, current) < 0)
    .sort((a, b) => compareVersions(b.parsed, a.parsed));
  if (!candidates.length) fail(`No v* tag found below ${version}. Pass --from <tag>.`);
  return candidates[0].tag;
}

function collectPullRequestNumbers(from, to) {
  const numbers = new Set();
  for (const subject of run('git', ['log', `${from}..${to}`, '--format=%s']).split('\n')) {
    const match = /^Merge pull request #(\d+)/.exec(subject) ?? /\(#(\d+)\)\s*$/.exec(subject);
    if (match) numbers.add(Number(match[1]));
  }
  return [...numbers].sort((a, b) => a - b);
}

function repoSlug() {
  const match = /github\.com\/([^/]+\/[^/]+?)(?:\.git)?$/.exec(readPackage('core').repository.url);
  if (!match) fail('Could not read the GitHub repository from packages/core/package.json');
  return match[1];
}

function fetchPullRequest(slug, number) {
  try {
    const pr = JSON.parse(run('gh', ['api', `repos/${slug}/pulls/${number}`]));
    const files = run('gh', [
      'api',
      `repos/${slug}/pulls/${number}/files`,
      '--paginate',
      '--jq',
      '.[].filename',
    ])
      .split('\n')
      .filter(Boolean);
    return {
      number,
      title: pr.title,
      author: pr.user.login,
      isBot: pr.user.type === 'Bot',
      labels: pr.labels.map((label) => label.name),
      files,
    };
  } catch (error) {
    if (/HTTP 404/.test(String(error.stderr))) {
      console.warn(`Skipping #${number}: not a pull request`);
      return null;
    }
    throw error;
  }
}

function isHidden(pr) {
  return pr.labels.includes(HIDE_LABEL) || (pr.isBot && pr.labels.includes('dependencies'));
}

function sectionFor(title) {
  const type = /^(\w+)(?:\([^)]*\))?!?:/.exec(title)?.[1].toLowerCase();
  return SECTION_BY_TYPE[type] ?? 'Other';
}

function formatEntry(slug, pr) {
  const prUrl = `https://github.com/${slug}/pull/${pr.number}`;
  return `- ${pr.title} [\\#${pr.number}](${prUrl}) ([${pr.author}](https://github.com/${pr.author}))`;
}

function formatSections(grouped) {
  const blocks = SECTION_ORDER.filter((name) => grouped[name]?.length).map(
    (name) => `**${name}**\n${grouped[name].join('\n')}`,
  );
  return blocks.length ? blocks.join('\n\n') : 'No notable changes.';
}

function splitSections(text) {
  const [header, ...sections] = text.split(/^(?=## \[v)/m);
  return { header: header.trim() || '# Changelog', sections };
}

function writeChangelog(name, version, versionSection) {
  const file = changelogPath(name);
  const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const { header, sections } = splitSections(existing);
  const kept = sections.filter((section) => !section.startsWith(`## [v${version}]`));
  const body = [versionSection, ...kept].map((section) => section.trim()).join('\n\n');
  fs.writeFileSync(file, `${header}\n\n${body}\n`);
  return file;
}

function generate(args) {
  const versions = PACKAGES.map((name) => readPackage(name).version);
  if (!args.version && new Set(versions).size !== 1) {
    fail(`Package versions differ (${versions.join(', ')}). Pass --version.`);
  }
  const version = args.version ?? versions[0];
  const previousTag = args.from ?? findPreviousTag(version);
  const slug = repoSlug();
  const numbers = collectPullRequestNumbers(previousTag, args.to).filter(
    (number) => !args.exclude.includes(number),
  );
  console.log(`v${version}: ${numbers.length} pull requests since ${previousTag}`);

  const grouped = Object.fromEntries(PACKAGES.map((name) => [name, {}]));
  for (const number of numbers) {
    const pr = fetchPullRequest(slug, number);
    if (!pr) continue;
    if (isHidden(pr)) {
      console.log(`Hiding #${number}: ${pr.title}`);
      continue;
    }
    const touched = PACKAGES.filter((name) =>
      pr.files.some((file) => file.startsWith(`packages/${name}/`)),
    );
    const section = touched.length ? sectionFor(pr.title) : 'Other';
    for (const name of touched.length ? touched : PACKAGES) {
      (grouped[name][section] ??= []).push(formatEntry(slug, pr));
    }
  }

  const date = new Date().toISOString().slice(0, 10);
  const heading = `## [v${version}](https://github.com/${slug}/tree/v${version}) (${date})`;
  const compare = `[Full Changelog](https://github.com/${slug}/compare/${previousTag}...v${version})`;
  const written = [];
  for (const name of PACKAGES) {
    const versionSection = `${heading}\n${compare}\n\n${formatSections(grouped[name])}`;
    if (args.dryRun) {
      console.log(`\n=== packages/${name}/CHANGELOG.md ===\n${versionSection}`);
    } else {
      written.push(writeChangelog(name, version, versionSection));
    }
  }
  if (written.length) {
    run('pnpm', ['exec', 'prettier', '--write', ...written]);
    console.log(`Updated ${written.map((file) => path.relative(ROOT, file)).join(', ')}`);
  }
}

function releaseBody({ pkg, version, npmTag }) {
  const file = changelogPath(pkg);
  const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const section = splitSections(text).sections.find((candidate) =>
    candidate.startsWith(`## [v${version}]`),
  );
  const notes = (section ?? '')
    .trim()
    .split('\n')
    .slice(1)
    .filter((line) => !line.startsWith('[Full Changelog]'))
    .join('\n')
    .trim();
  if (!notes) {
    fail(
      `${path.relative(ROOT, file)} has no section for v${version}. Run "pnpm changelog" in the version bump PR.`,
    );
  }
  const name = `@auth0/universal-components-${pkg}`;
  const requires =
    pkg === 'react' ? `**Requires**: \`@auth0/universal-components-core@${version}\`\n` : '';
  return [
    'Published to NPM',
    '',
    `**Package**: \`${name}\``,
    `**Version**: \`${version}\``,
    `**NPM Tag**: \`${npmTag}\``,
    `${requires}`,
    '```bash',
    `npm install ${name}@${version}`,
    '```',
    '',
    `[View on NPM](https://www.npmjs.com/package/${name}/v/${version})`,
    '',
    notes,
    '',
  ].join('\n');
}

const args = parseArgs(process.argv.slice(2));
if (args.releaseBody) {
  process.stdout.write(releaseBody(args.releaseBody));
} else {
  generate(args);
}
