import { NextResponse } from 'next/server';

// Read API_DOCS_URL per request so deployments can point docs elsewhere
// without rebuilding. A route handler avoids a streamed HTML/meta redirect.
export const dynamic = 'force-dynamic';

export function GET() {
  const docsUrl = process.env.API_DOCS_URL;
  if (!docsUrl && process.env.NODE_ENV === 'production') {
    throw new Error('API_DOCS_URL is required in production.');
  }
  return NextResponse.redirect(docsUrl ?? 'http://localhost:3000/docs', 307);
}
