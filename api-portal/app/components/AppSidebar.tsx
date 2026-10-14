'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';
import { BookOpen, ChevronDown, CircleCheck, History, House, PanelLeft } from 'lucide-react';

const navigation = [
  { label: 'Home', href: '/', icon: House },
  { label: 'API Docs', href: '/docs', icon: BookOpen },
  { label: 'Status', href: '/status', icon: CircleCheck },
  { label: 'Changelog', href: '/changelog', icon: History },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileTrigger = useRef<HTMLButtonElement>(null);

  return (
    <aside
      aria-label="Portal sidebar"
      className={`sticky top-0 flex h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-ink transition-[width] duration-200 motion-reduce:transition-none ${
        collapsed ? 'w-16' : 'w-16 md:w-64'
      }`}
    >
      <header className="flex h-20 shrink-0 items-center justify-center border-b border-sidebar-border px-2 md:justify-between md:px-5">
        {!collapsed && (
          <Link href="/" className="hidden text-2xl font-bold tracking-tight text-brand-dark md:block">
            ecobite<span className="text-brand">.</span>
          </Link>
        )}
        <button
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          aria-controls="portal-navigation"
          onClick={() => setCollapsed((value) => !value)}
          className="hidden size-9 shrink-0 items-center justify-center rounded-lg hover:bg-sidebar-hover md:flex"
        >
          <PanelLeft className="size-4" strokeWidth={1.75} />
        </button>
        <Link href="/" aria-label="EcoBite overview" className="font-bold text-brand-dark md:hidden">
          e<span className="text-brand">.</span>
        </Link>
      </header>

      <nav id="portal-navigation" aria-label="Portal sections" className="min-h-0 flex-1 overflow-y-auto px-2 py-6">
        <ul className="space-y-1.5">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  aria-label={label}
                  title={label}
                  className={`flex min-h-11 items-center gap-3 rounded-lg text-sm font-medium ${
                    collapsed ? 'justify-center px-0' : 'justify-center px-0 md:justify-start md:px-3'
                  } ${active ? 'bg-brand-soft text-brand-dark' : 'hover:bg-sidebar-hover'}`}
                >
                  <Icon className="size-[18px] shrink-0" strokeWidth={1.75} />
                  {!collapsed && <span className="hidden md:inline">{label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className="relative border-t border-sidebar-border p-2"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setProfileOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setProfileOpen(false);
            profileTrigger.current?.focus();
          }
        }}
      >
        {profileOpen && (
          <div id="portal-profile" className="absolute bottom-full left-2 z-20 mb-2 w-60 rounded-xl border border-sidebar-border bg-white p-4 shadow-lg">
            <p className="text-sm font-semibold text-brand-dark">Account preview</p>
            <p className="mt-2 text-xs leading-5 text-muted">
              Google sign-in is not connected yet. This panel does not represent an authenticated session.
            </p>
            <button type="button" disabled className="mt-3 w-full rounded-lg border border-sidebar-border px-3 py-2 text-left text-sm text-muted disabled:cursor-not-allowed">
              Log out — unavailable
            </button>
          </div>
        )}
        <button
          ref={profileTrigger}
          type="button"
          aria-label="Account preview"
          aria-expanded={profileOpen}
          aria-controls="portal-profile"
          onClick={() => setProfileOpen((value) => !value)}
          className={`flex min-h-14 w-full items-center gap-3 rounded-lg hover:bg-sidebar-hover ${
            collapsed ? 'justify-center' : 'justify-center md:px-2'
          }`}
        >
          <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full border border-sidebar-border bg-white text-sm font-semibold">
            N
          </span>
          {!collapsed && (
            <>
              <span className="hidden min-w-0 flex-1 text-left md:block">
                <span className="block truncate text-sm font-semibold">NaferJ</span>
                <span className="block text-xs text-muted">Account preview</span>
              </span>
              <ChevronDown className={`hidden size-3 shrink-0 md:block ${profileOpen ? 'rotate-180' : ''}`} strokeWidth={1.75} />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
