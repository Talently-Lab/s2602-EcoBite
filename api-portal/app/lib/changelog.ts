import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';

export const REPO_ISSUES_URL = 'https://github.com/Talently-Lab/s2602-EcoBite/issues';

export type ChangelogSectionKind =
  | 'highlights'
  | 'added'
  | 'changed'
  | 'deprecated'
  | 'removed'
  | 'fixed'
  | 'security';

export type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'code'; value: string }
  | { type: 'strong'; children: InlineNode[] }
  | { type: 'link'; href: string; children: InlineNode[] };

export type ChangelogEntry = InlineNode[];

export type ChangelogSection = {
  kind: ChangelogSectionKind;
  entries: ChangelogEntry[];
};

export type ChangelogRelease = {
  version: string;
  unreleased: boolean;
  date: string | null;
  description: InlineNode[][];
  sections: ChangelogSection[];
  compareUrl?: string;
  releaseUrl?: string;
  changeCount: number;
};

export type Changelog = { releases: ChangelogRelease[] };

const SECTION_KINDS: Record<string, ChangelogSectionKind> = {
  highlights: 'highlights',
  added: 'added',
  changed: 'changed',
  deprecated: 'deprecated',
  removed: 'removed',
  fixed: 'fixed',
  security: 'security',
};

const REFERENCE_RE = /^\[([^\]]+)\]:\s*(\S+)\s*$/;
const ITEM_RE = /^\s*[-*]\s+/;
const CONTINUATION_RE = /^\s{2,}\S/;
const UNRELEASED_RE = /^##\s+\[?Unreleased\]?\s*$/i;
const DATED_RELEASE_RE = /^##\s+\[?(\d+\.\d+\.\d+[^\s\]]*)\]?\s*-\s*(\d{4}-\d{2}-\d{2})\s*$/;
const UNDATED_RELEASE_RE = /^##\s+\[?(\d+\.\d+\.\d+[^\s\]]*)\]?\s*$/;

function parseInline(input: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let text = '';
  let i = 0;

  const flushText = () => {
    if (text) {
      nodes.push({ type: 'text', value: text });
      text = '';
    }
  };

  while (i < input.length) {
    if (input[i] === '`') {
      const end = input.indexOf('`', i + 1);
      if (end === -1) {
        text += input[i];
        i += 1;
        continue;
      }
      flushText();
      nodes.push({ type: 'code', value: input.slice(i + 1, end) });
      i = end + 1;
      continue;
    }
    if (input.startsWith('**', i)) {
      const end = input.indexOf('**', i + 2);
      if (end === -1) {
        text += '**';
        i += 2;
        continue;
      }
      flushText();
      nodes.push({ type: 'strong', children: parseInline(input.slice(i + 2, end)) });
      i = end + 2;
      continue;
    }
    if (input[i] === '[') {
      const labelEnd = input.indexOf('](', i);
      const hrefEnd = labelEnd === -1 ? -1 : input.indexOf(')', labelEnd + 2);
      if (labelEnd === -1 || hrefEnd === -1) {
        text += input[i];
        i += 1;
        continue;
      }
      flushText();
      nodes.push({
        type: 'link',
        href: input.slice(labelEnd + 2, hrefEnd),
        children: parseInline(input.slice(i + 1, labelEnd)),
      });
      i = hrefEnd + 1;
      continue;
    }
    text += input[i];
    i += 1;
  }
  flushText();
  return nodes;
}

export function parseChangelog(markdown: string): Changelog {
  const releases: ChangelogRelease[] = [];
  const referenceUrls = new Map<string, string>();
  let currentRelease: ChangelogRelease | null = null;
  let currentSection: ChangelogSection | null = null;
  let currentEntryText: string | null = null;
  let descriptionLines: string[] = [];

  const flushDescription = () => {
    if (currentRelease && descriptionLines.length > 0) {
      currentRelease.description.push(parseInline(descriptionLines.join(' ')));
      descriptionLines = [];
    }
  };

  for (const line of markdown.split(/\r?\n/)) {
    const referenceMatch = REFERENCE_RE.exec(line);
    if (referenceMatch) {
      flushDescription();
      referenceUrls.set(referenceMatch[1], referenceMatch[2]);
      continue;
    }

    if (line.startsWith('## ')) {
      flushDescription();
      currentEntryText = null;
      currentSection = null;
      const unreleased = UNRELEASED_RE.test(line);
      const dated = DATED_RELEASE_RE.exec(line);
      const undated = dated ? null : UNDATED_RELEASE_RE.exec(line);
      if (unreleased) {
        currentRelease = {
          version: 'Unreleased',
          unreleased: true,
          date: null,
          description: [],
          sections: [],
          changeCount: 0,
        };
      } else if (dated) {
        currentRelease = {
          version: dated[1],
          unreleased: false,
          date: dated[2],
          description: [],
          sections: [],
          changeCount: 0,
        };
      } else if (undated) {
        currentRelease = {
          version: undated[1],
          unreleased: false,
          date: null,
          description: [],
          sections: [],
          changeCount: 0,
        };
      } else {
        throw new Error(`CHANGELOG.md: encabezado de versión no reconocido: ${line}`);
      }
      releases.push(currentRelease);
      continue;
    }

    if (!currentRelease) {
      continue; // Todo lo anterior al primer encabezado '## ' se ignora.
    }

    if (line.startsWith('### ')) {
      flushDescription();
      currentEntryText = null;
      const kind = SECTION_KINDS[line.slice(4).trim().toLowerCase()];
      if (!kind) {
        throw new Error(`CHANGELOG.md: sección no reconocida: ${line}`);
      }
      currentSection = { kind, entries: [] };
      currentRelease.sections.push(currentSection);
      continue;
    }

    if (ITEM_RE.test(line)) {
      if (!currentSection) {
        throw new Error(`CHANGELOG.md: entrada fuera de una sección '###': ${line}`);
      }
      currentEntryText = line.replace(ITEM_RE, '');
      currentSection.entries.push(parseInline(currentEntryText));
      currentRelease.changeCount += 1;
      continue;
    }

    if (!line.trim()) {
      flushDescription();
      currentEntryText = null;
      continue;
    }

    if (currentSection && currentEntryText !== null && CONTINUATION_RE.test(line)) {
      // Une continuaciones a la entrada en curso con un solo espacio.
      currentEntryText = `${currentEntryText} ${line.trim()}`;
      currentSection.entries[currentSection.entries.length - 1] = parseInline(currentEntryText);
      continue;
    }

    if (!currentSection) {
      // Párrafo libre entre el encabezado de versión y la primera sección.
      descriptionLines.push(line.trim());
      continue;
    }
  }

  flushDescription();

  for (const release of releases) {
    const compareLabel = release.unreleased ? 'Unreleased' : release.version;
    const compareUrl = referenceUrls.get(compareLabel);
    if (compareUrl) {
      release.compareUrl = compareUrl;
    }
    const releaseUrl = referenceUrls.get(`${release.version} release`);
    if (releaseUrl) {
      release.releaseUrl = releaseUrl;
    }
  }

  return { releases };
}

export const getChangelog: () => Promise<Changelog> = cache(async () => {
  const changelogPath = path.resolve(process.cwd(), '..', 'backend', 'CHANGELOG.md');
  const markdown = await readFile(changelogPath, 'utf8');
  return parseChangelog(markdown);
});

export function inlineToText(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'strong' || node.type === 'link') {
        return inlineToText(node.children);
      }
      return node.value;
    })
    .join('');
}

export function formatReleaseDate(date: string, style: 'short' | 'long'): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: style === 'short' ? 'medium' : 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
