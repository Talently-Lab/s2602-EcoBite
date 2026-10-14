import type { ReactNode } from 'react';

type OverviewColumnProps = {
  topSpace: 'large' | 'small';
  topDecoration?: ReactNode;
  upperContent?: ReactNode;
  lowerContent?: ReactNode;
  bottomDecoration?: ReactNode;
};

// Keep the reference's 350:350 middle blocks equal. The outer blocks absorb
// the staggered offset, so every column ends at the same viewport edge.
const rowTemplates = {
  large: 'minmax(0,24fr) minmax(0,35fr) minmax(0,35fr) minmax(0,13fr)',
  small: 'minmax(0,12fr) minmax(0,35fr) minmax(0,35fr) minmax(0,25fr)',
} as const;

export function OverviewColumn({
  topSpace,
  topDecoration,
  upperContent,
  lowerContent,
  bottomDecoration,
}: OverviewColumnProps) {
  return (
    <div
      data-offset={topSpace}
      className="overview-column grid min-h-0 min-w-0 border-r border-sidebar-border last:border-r-0"
      style={{ gridTemplateRows: rowTemplates[topSpace] }}
    >
      <div className="relative overflow-hidden border-b border-sidebar-border">{topDecoration}</div>
      <div className="min-h-0 min-w-0 break-words border-b border-sidebar-border p-[clamp(0.375rem,1.4vw,1.5rem)]">
        {upperContent}
      </div>
      <div className="min-h-0 min-w-0 break-words border-b border-sidebar-border p-[clamp(0.375rem,1.4vw,1.5rem)]">
        {lowerContent}
      </div>
      <div className="relative overflow-hidden">{bottomDecoration}</div>
    </div>
  );
}
