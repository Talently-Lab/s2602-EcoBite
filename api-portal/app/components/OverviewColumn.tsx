import type { ReactNode } from 'react';

type OverviewColumnProps = {
  topSpace: 'large' | 'small';
  topDecoration?: ReactNode;
  upperDecoration?: ReactNode;
  upperContent?: ReactNode;
  upperAction?: ReactNode;
  lowerDecoration?: ReactNode;
  lowerContent?: ReactNode;
  lowerAction?: ReactNode;
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
  upperDecoration,
  upperContent,
  upperAction,
  lowerDecoration,
  lowerContent,
  lowerAction,
  bottomDecoration,
}: OverviewColumnProps) {
  return (
    <div
      data-offset={topSpace}
      className="overview-column grid min-h-0 min-w-0 border-r border-overview-border last:border-r-0"
      style={{ gridTemplateRows: rowTemplates[topSpace] }}
    >
      <div className={`relative overflow-hidden border-b border-overview-border ${topDecoration ? '' : 'bg-sidebar-hover'}`}>
        {topDecoration}
      </div>
      <div className={`relative flex min-h-0 min-w-0 flex-col break-words overflow-hidden border-b border-overview-border p-[clamp(0.375rem,1.4vw,1.5rem)] ${upperContent || upperDecoration ? '' : 'bg-sidebar-hover'}`}>
        {upperDecoration}
        <div className={upperDecoration ? 'relative z-10 h-full' : ''}>{upperContent}</div>
        {upperAction && <div className="relative z-10 mt-auto flex justify-end pt-3">{upperAction}</div>}
      </div>
      <div className={`relative flex min-h-0 min-w-0 flex-col break-words overflow-hidden border-b border-overview-border p-[clamp(0.375rem,1.4vw,1.5rem)] ${lowerContent || lowerDecoration ? '' : 'bg-sidebar-hover'}`}>
        {lowerDecoration}
        <div className={lowerDecoration ? 'relative z-10 h-full' : ''}>{lowerContent}</div>
        {lowerAction && <div className="relative z-10 mt-auto flex justify-end pt-3">{lowerAction}</div>}
      </div>
      <div className={`relative overflow-hidden ${bottomDecoration ? '' : 'bg-sidebar-hover'}`}>
        {bottomDecoration}
      </div>
    </div>
  );
}
