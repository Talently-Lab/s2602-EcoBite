import { redirect } from 'next/navigation';

// Read API_DOCS_URL per request so deployments can point docs elsewhere
// without rebuilding.
export const dynamic = 'force-dynamic';

export default function DocsPage() {
  redirect(process.env.API_DOCS_URL ?? 'http://localhost:3000/docs');
}
