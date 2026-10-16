'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, BookOpen, ChevronDown, CircleCheck, History, House, PanelLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type NavItem = { label: string; href: string; icon: LucideIcon; external?: boolean };

const navigation: NavItem[] = [
  { label: 'Inicio', href: '/', icon: House },
  { label: 'Documentación', href: '/docs', icon: BookOpen, external: true },
  { label: 'Estado', href: '/status', icon: CircleCheck },
  { label: 'Novedades', href: '/changelog', icon: History },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const profileArea = useRef<HTMLDivElement>(null);
  const profileTrigger = useRef<HTMLButtonElement>(null);

  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setProfileOpen(false);
  }

  useEffect(() => {
    if (!profileOpen) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!profileArea.current?.contains(event.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [profileOpen]);

  return (
    <aside
      id="portal-sidebar"
      aria-label="Barra lateral del portal"
      className={`sticky top-0 z-30 flex h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-ink transition-[width] duration-200 motion-reduce:transition-none ${
        collapsed ? 'w-16' : 'w-16 md:w-64'
      }`}
    >
      <header
        className={`flex h-20 shrink-0 items-center border-b border-sidebar-border px-2 md:px-5 ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!collapsed && (
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/" aria-label="Inicio de EcoBite">
              <Image
                src="/images/logo-eco-01.png"
                alt="EcoBite"
                width={454}
                height={115}
                priority
                className="h-9 w-auto"
              />
            </Link>
            <span className="rounded bg-sidebar-border px-1 py-px text-[0.625rem] font-semibold text-muted">
              API
            </span>
          </div>
        )}
        <button
          type="button"
          aria-label={collapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
          aria-expanded={!collapsed}
          aria-controls="portal-sidebar"
          title={collapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
          onClick={() => setCollapsed((value) => !value)}
          className="hidden size-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-sidebar-border hover:text-ink md:flex"
        >
          <PanelLeft aria-hidden="true" className="size-4" strokeWidth={1.75} />
        </button>
        <Link href="/" aria-label="Inicio de EcoBite" className={collapsed ? 'block' : 'block md:hidden'}>
          <Image
            src="/images/logo-frog.png"
            alt="EcoBite"
            width={165}
            height={116}
            priority
            className="size-9"
          />
        </Link>
      </header>

      <nav aria-label="Secciones del portal" className="min-h-0 flex-1 overflow-y-auto px-2 py-6">
        <ul className="space-y-1.5">
          {navigation.map(({ label, href, icon: Icon, external }) => {
            const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  aria-label={external ? `${label} (se abre en una pestaña nueva)` : label}
                  title={label}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={`flex min-h-11 items-center gap-3 rounded-lg text-sm font-medium transition-colors motion-reduce:transition-none ${
                    collapsed ? 'justify-center px-0' : 'justify-center px-0 md:justify-start md:px-3'
                  } ${active ? 'bg-brand-soft font-semibold text-brand-dark' : 'hover:bg-sidebar-border hover:text-heading'}`}
                >
                  <Icon aria-hidden="true" className="size-[18px] shrink-0" strokeWidth={1.75} />
                  {!collapsed && <span className="hidden md:inline">{label}</span>}
                  {!collapsed && external && (
                    <ArrowUpRight aria-hidden="true" className="ml-auto hidden size-[18px] text-muted md:inline" strokeWidth={1.75} />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        ref={profileArea}
        className="relative border-t border-sidebar-border p-2"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setProfileOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && profileOpen) {
            setProfileOpen(false);
            profileTrigger.current?.focus();
          }
        }}
      >
        <div
          id="portal-profile"
          hidden={!profileOpen}
          className="absolute bottom-full left-2 z-20 mb-2 w-60 rounded-xl border border-sidebar-border bg-white p-4 shadow-lg"
        >
          <p className="text-sm font-semibold text-brand-dark">Vista previa de la cuenta</p>
          <p className="mt-2 text-xs leading-5 text-muted">
            El inicio de sesión con Google aún no está conectado. Este panel no representa una sesión autenticada.
          </p>
          <button type="button" disabled className="mt-3 w-full rounded-lg border border-sidebar-border px-3 py-2 text-left text-sm text-muted disabled:cursor-not-allowed">
            Cerrar sesión — no disponible
          </button>
        </div>
        <button
          ref={profileTrigger}
          type="button"
          aria-label="NaferJ — vista previa de la cuenta"
          aria-expanded={profileOpen}
          aria-controls="portal-profile"
          onClick={() => setProfileOpen((value) => !value)}
          className={`flex min-h-14 w-full items-center gap-3 rounded-lg hover:bg-sidebar-border ${
            collapsed ? 'justify-center' : 'justify-center md:px-2'
          } ${profileOpen ? 'bg-sidebar-hover' : ''}`}
        >
          <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full border border-sidebar-border bg-white text-sm font-semibold">
            N
          </span>
          {!collapsed && (
            <>
              <span className="hidden min-w-0 flex-1 text-left md:block">
                <span className="block truncate text-sm font-semibold">NaferJ</span>
                <span className="block text-xs text-muted">Vista previa de la cuenta</span>
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`hidden size-3 shrink-0 transition-transform motion-reduce:transition-none md:block ${profileOpen ? 'rotate-180' : ''}`}
                strokeWidth={1.75}
              />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
