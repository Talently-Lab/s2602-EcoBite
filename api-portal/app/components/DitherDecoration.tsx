'use client';

import { Warp } from '@paper-design/shaders-react';

type ColorBlockProps = {
  variant: 'dark' | 'soft' | 'brand' | 'cream';
};

const palettes = {
  dark: ['#024023', '#14ae5c', '#024023', '#009951'],
  soft: ['#dcffcf', '#14ae5c', '#ffebc6', '#04e762'],
  brand: ['#14ae5c', '#024023', '#dcffcf', '#009951'],
  cream: ['#ffebc6', '#14ae5c', '#ffebc6', '#024023'],
} as const;

export function DitherDecoration({ variant }: ColorBlockProps) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <Warp
        width="100%"
        height="100%"
        colors={[...palettes[variant]]}
        proportion={0.45}
        softness={1}
        distortion={0.25}
        swirl={0.8}
        swirlIterations={10}
        shape="checks"
        shapeScale={0.1}
        speed={1}
        scale={1}
        maxPixelCount={400000}
      />
    </div>
  );
}
