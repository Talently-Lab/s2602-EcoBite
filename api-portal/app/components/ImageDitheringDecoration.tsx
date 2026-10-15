'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from './Skeleton';

// WebGL can't render on the server; load the shader on the client and show a
// placeholder of the same size meanwhile so the layout never jumps.
const ImageDithering = dynamic(
  () => import('@paper-design/shaders-react').then((module) => module.ImageDithering),
  { ssr: false, loading: () => <Skeleton className="size-full rounded-none" /> },
);

const EXAMPLE_IMAGE = '/images/dither-sample.jpg';

type ImageDitheringDecorationProps = {
  image?: string;
  colorBack?: string;
  colorFront?: string;
  colorHighlight?: string;
};

export function ImageDitheringDecoration({
  image = EXAMPLE_IMAGE,
  colorBack = '#ffffff',
  colorFront = '#22e66b',
  colorHighlight = '#22e66b',
}: ImageDitheringDecorationProps) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <ImageDithering
        width="100%"
        height="100%"
        image={image}
        colorBack={colorBack}
        colorFront={colorFront}
        colorHighlight={colorHighlight}
        originalColors={false}
        inverted={false}
        type="8x8"
        size={2}
        colorSteps={7}
        fit="cover"
      />
    </div>
  );
}
