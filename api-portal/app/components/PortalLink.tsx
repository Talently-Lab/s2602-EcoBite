import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';

type PortalLinkProps = {
  href: string;
  children: ReactNode;
  newTab?: boolean;
};

export function PortalLink({ href, children, newTab = true }: PortalLinkProps) {
  return (
    <Link
      href={href}
      {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="inline-flex items-center justify-center rounded-sm border border-overview-border bg-sidebar-hover px-2 py-1.5 text-[0.8125rem] font-medium text-heading shadow-[inset_0_-2px_0_#d9d9d5,0_1px_3px_0_rgba(51,51,51,0.16)] hover:bg-white hover:shadow-none active:shadow-none"
    >
      {children}
      {newTab && <span className="sr-only">(se abre en una pestaña nueva)</span>}
      {newTab && <ArrowUpRight aria-hidden="true" className="ml-1 size-3" strokeWidth={1.75} />}
    </Link>
  );
}
