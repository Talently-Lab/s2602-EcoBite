'use client';

import { ImageDithering } from '@paper-design/shaders-react';

const EXAMPLE_IMAGE = 'https://images.pexels.com/photos/4411214/pexels-photo-4411214.jpeg';

type ImageDitheringDecorationProps = {
  image?: string;
  invertColors?: boolean;
};

export function ImageDitheringDecoration({
  image = EXAMPLE_IMAGE,
  invertColors = false,
}: ImageDitheringDecorationProps) {
  const colorBack = invertColors ? '#3a3a45' : '#ffffff';
  const colorFront = invertColors ? '#ffffff' : '#3a3a45';

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <ImageDithering
        width="100%"
        height="100%"
        image={image}
        colorBack={colorBack}
        colorFront={colorFront}
        colorHighlight={colorFront}
        originalColors={false}
        inverted={false}
        type="8x8"
        size={2}
        colorSteps={2}
        fit="cover"
      />
    </div>
  );
}
