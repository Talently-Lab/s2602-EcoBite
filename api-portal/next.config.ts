import path from 'node:path';
import type { NextConfig } from 'next';

const workspaceRoot = path.resolve(import.meta.dirname, '..');

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingRoot: workspaceRoot,
  turbopack: { root: workspaceRoot },
};

export default nextConfig;
