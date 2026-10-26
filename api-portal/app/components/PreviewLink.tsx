import Link from 'next/link';
import { useId, type ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';

export type LinkPreview = {
  domain: string;
  title: string;
  description: string;
};

export function describeLink(href: string): LinkPreview {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return { domain: '', title: href, description: 'Enlace externo' };
  }
  const domain = url.hostname;
  const parts = url.pathname.split('/').filter(Boolean);

  if (domain === 'github.com' || domain === 'www.github.com') {
    const [owner, repo, section, detail] = parts;
    const repoName = owner && repo ? `${owner}/${repo}` : 'GitHub';
    if (section === 'issues' && detail) {
      return { domain, title: `Issue #${detail}`, description: `Issue en ${repoName}` };
    }
    if (section === 'pull' && detail) {
      return { domain, title: `Pull request #${detail}`, description: `Pull request en ${repoName}` };
    }
    if (section === 'compare' && detail) {
      return {
        domain,
        title: `Comparar ${detail.replace('...', '…')}`,
        description: 'Diferencias entre versiones en GitHub',
      };
    }
    if (section === 'releases' && detail === 'tag' && parts[4]) {
      return { domain, title: `Release ${parts[4]}`, description: 'Notas de la versión en GitHub' };
    }
    if (section === 'issues') {
      return { domain, title: 'Issues del repositorio', description: 'Reporta problemas de la API' };
    }
  }
  if (domain === 'keepachangelog.com' || domain.endsWith('.keepachangelog.com')) {
    return { domain, title: 'Keep a Changelog', description: 'Formato del historial de cambios' };
  }
  if (domain === 'semver.org' || domain.endsWith('.semver.org')) {
    return { domain, title: 'Semantic Versioning', description: 'Estándar de versionado semántico' };
  }
  return { domain, title: domain, description: 'Enlace externo' };
}

type PreviewLinkProps = {
  href: string;
  children: ReactNode;
  preview?: { title: string; description: string };
  newTab?: boolean;
  className?: string;
};

export function PreviewLink({ href, children, preview, newTab, className }: PreviewLinkProps) {
  const tooltipId = useId();
  const external = /^https?:\/\//i.test(href);
  const openNewTab = newTab ?? external;
  const meta = describeLink(href);
  const title = preview?.title ?? meta.title;
  const description = preview?.description ?? meta.description;
  const linkClassName = `text-heading underline decoration-brand/60 underline-offset-4 hover:decoration-brand-dark${className ? ` ${className}` : ''}`;
  const targetProps = openNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  const contents = (
    <>
      {children}
      {openNewTab && <span className="sr-only"> (se abre en una pestaña nueva)</span>}
      {openNewTab && (
        <ArrowUpRight aria-hidden="true" className="mb-0.5 ml-0.5 inline size-3" strokeWidth={1.75} />
      )}
    </>
  );

  return (
    <span className="group relative inline-block">
      {external ? (
        <a href={href} aria-describedby={tooltipId} className={linkClassName} {...targetProps}>
          {contents}
        </a>
      ) : (
        <Link href={href} aria-describedby={tooltipId} className={linkClassName} {...targetProps}>
          {contents}
        </Link>
      )}
      <span
        role="tooltip"
        id={tooltipId}
        className="absolute left-0 top-full z-20 mt-2 hidden w-64 max-w-[calc(100vw-2.5rem)] rounded-lg border border-sidebar-border bg-white p-3 text-left shadow-lg group-hover:block group-focus-within:block"
      >
        <span className="block font-mono text-xs text-muted">{meta.domain}</span>
        <span className="mt-1 block text-sm font-semibold text-brand-dark">{title}</span>
        <span className="mt-1 block text-xs text-muted">{description}</span>
      </span>
    </span>
  );
}
