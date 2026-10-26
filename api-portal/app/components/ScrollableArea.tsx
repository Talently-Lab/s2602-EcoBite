'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronsDown } from 'lucide-react';

// Hides the scrollbar and replaces it with a bottom fade + chevron that stays
// only while there is more content below, so the block still reads as scrollable.
export function ScrollableArea({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(false);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      setShowHint(el.scrollHeight - el.clientHeight - el.scrollTop > 4);
    }
  }, []);

  useEffect(() => {
    update();
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update]);

  return (
    <div className="relative z-10 min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={update}
        className="h-full overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      {showHint && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 flex h-10 items-end justify-center bg-gradient-to-t from-white via-white/70 to-transparent pb-1"
        >
          <ChevronsDown
            aria-hidden="true"
            className="size-4 text-muted motion-safe:animate-bounce"
            strokeWidth={1.75}
          />
        </div>
      )}
    </div>
  );
}
