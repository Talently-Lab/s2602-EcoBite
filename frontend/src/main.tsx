import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { mainRouter } from './router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PageSkeleton } from './components/PageSkeleton'

const syncDarkClass = () => {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", isDark);
};

syncDarkClass();
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", syncDarkClass);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // 1 min
      refetchOnWindowFocus: false, // opcional, evita refetch al cambiar de pestaña
      retry: 1,                    // reintentos ante error
    },
  },
})

// Devtools solo en desarrollo: fuera del bundle de producción.
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((m) => ({
        default: m.ReactQueryDevtools,
      })),
    )
  : null;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<PageSkeleton />}>
        <RouterProvider router={mainRouter} />
      </Suspense>
      {ReactQueryDevtools ? (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      ) : null}
    </QueryClientProvider>
  </StrictMode>,
)
