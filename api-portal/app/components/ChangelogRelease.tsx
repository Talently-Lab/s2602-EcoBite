import { Fragment } from 'react';
import type {
  ChangelogRelease as ChangelogReleaseData,
  ChangelogSectionKind,
  InlineNode,
} from '../lib/changelog';
import { formatReleaseDate, REPO_ISSUES_URL } from '../lib/changelog';
import { PreviewLink } from './PreviewLink';

export const changelogSectionStyles: Record<
  Exclude<ChangelogSectionKind, 'highlights'>,
  { label: string; className: string }
> = {
  added: { label: 'Añadido', className: 'text-success' },
  changed: { label: 'Cambiado', className: 'text-changed' },
  deprecated: { label: 'Obsoleto', className: 'text-muted' },
  removed: { label: 'Eliminado', className: 'text-heading' },
  fixed: { label: 'Corregido', className: 'text-heading' },
  security: { label: 'Seguridad', className: 'text-danger' },
};

export function InlineNodes({ nodes }: { nodes: InlineNode[] }) {
  return nodes.map((node, index) => {
    switch (node.type) {
      case 'code':
        return (
          <code key={index} className="rounded bg-sidebar-hover px-1 py-0.5 font-mono text-[0.9em]">
            {node.value}
          </code>
        );
      case 'strong':
        return (
          <strong key={index}>
            <InlineNodes nodes={node.children} />
          </strong>
        );
      case 'link':
        return (
          <PreviewLink key={index} href={node.href}>
            <InlineNodes nodes={node.children} />
          </PreviewLink>
        );
      default:
        return <Fragment key={index}>{node.value}</Fragment>;
    }
  });
}

export function ChangelogRelease({ release }: { release: ChangelogReleaseData }) {
  const headingId = `release-${release.unreleased ? 'unreleased' : release.version.replaceAll('.', '-')}`;
  const links = [
    release.releaseUrl ? { key: 'release', href: release.releaseUrl, label: 'GitHub Release' } : null,
    release.compareUrl ? { key: 'compare', href: release.compareUrl, label: 'Comparar cambios' } : null,
  ].filter((link): link is { key: string; href: string; label: string } => link !== null);

  return (
    <article aria-labelledby={headingId}>
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id={headingId} className="font-mono font-semibold text-heading">
          {release.unreleased ? 'Sin publicar' : `v${release.version}`}
        </h2>
        {links.map((link) => (
          <Fragment key={link.key}>
            <span aria-hidden="true" className="text-muted">
              •
            </span>
            <PreviewLink href={link.href}>{link.label}</PreviewLink>
          </Fragment>
        ))}
        {release.unreleased ? (
          <span className="ml-auto font-mono text-sm text-muted">
            En desarrollo
          </span>
        ) : (
          release.date && (
            <time dateTime={release.date} className="ml-auto font-mono text-muted">
              {formatReleaseDate(release.date, 'long')}
            </time>
          )
        )}
      </header>
      <p className="mt-2 text-muted">
        Si encuentras un problema, repórtalo en{' '}
        <PreviewLink href={REPO_ISSUES_URL}>la página de issues</PreviewLink>.
      </p>
      {release.description.length > 0 && (
        <div className="mt-4 space-y-3">
          {release.description.map((paragraph, index) => (
            <p key={index}>
              <InlineNodes nodes={paragraph} />
            </p>
          ))}
        </div>
      )}
      {release.sections.length > 0 && (
        <ul className="mt-5 space-y-5">
          {[
            ...release.sections.filter((section) => section.kind === 'security'),
            ...release.sections.filter((section) => section.kind !== 'security'),
          ].map((section, sectionIndex) => {
            const style = changelogSectionStyles[section.kind === 'highlights' ? 'added' : section.kind];
            return (
              <li key={`${section.kind}-${sectionIndex}`}>
                <ul className="space-y-2">
                  {section.entries.map((entry, entryIndex) => (
                    <li key={entryIndex} className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-[6rem_minmax(0,1fr)]">
                      <span className={`font-semibold ${style.className}`}>{style.label}</span>
                      <div className="min-w-0 break-words">
                        <InlineNodes nodes={entry} />
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
