#!/usr/bin/env node

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import semver from 'semver';
import { fileURLToPath } from 'url';
import { parseArgs as parseCliArgs } from 'util';

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
const REF_PATTERN = /^[\w./@^~][\w./@^~-]*$/;
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

function parseArgs(argv) {
  let parsed;
  try {
    parsed = parseCliArgs({
      args: argv,
      allowPositionals: true,
      options: {
        exclude: { type: 'string', multiple: true },
        version: { type: 'string' },
        from: { type: 'string' },
        to: { type: 'string' },
        'dry-run': { type: 'boolean' },
        'release-body': { type: 'boolean' },
      },
    });
  } catch (error) {
    fail(error.message.split('\n')[0]);
  }
  const { values, positionals } = parsed;
  const args = {
    exclude: (values.exclude ?? []).map((value) => {
      if (!/^\d+$/.test(value)) fail(`--exclude expects a PR number, got "${value}"`);
      return Number(value);
    }),
    version: values.version,
    from: values.from,
    to: values.to ?? 'HEAD',
    dryRun: values['dry-run'] ?? false,
  };
  if (values['release-body']) {
    if (positionals.length !== 3) fail('--release-body expects <core|react> <version> <npm-tag>');
    const [pkg, version, npmTag] = positionals;
    args.releaseBody = { pkg, version, npmTag };
  } else if (positionals.length) {
    fail(`Unknown argument: ${positionals[0]}`);
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
    if (!VERSION_PATTERN.test(version)) fail(`Invalid version: ${version}`);
    if (!NPM_TAG_PATTERN.test(npmTag)) fail(`Invalid npm tag: ${npmTag}`);
  }
  return args;
}

function findPreviousTag(version) {
  const stable = !semver.prerelease(version);
  const candidates = run('git', ['tag', '--list', 'v*'])
    .split('\n')
    .map((tag) => tag.trim())
    .filter((tag) => semver.valid(tag.slice(1)) && semver.lt(tag.slice(1), version))
    .filter((tag) => !stable || !semver.prerelease(tag.slice(1)))
    .sort((a, b) => semver.rcompare(a.slice(1), b.slice(1)));
  if (!candidates.length) fail(`No v* tag found below ${version}. Pass --from <tag>.`);
  return candidates[0];
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
    if (!touched.length) {
      console.log(`Skipping #${number}: touches neither package: ${pr.title}`);
      continue;
    }
    const section = sectionFor(pr.title);
    for (const name of touched) {
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
