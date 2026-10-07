export const PageSkeleton = () => {
  // ESTE VA A SER EL LOADER PRINCIPAL DE  TODA LA APP, corregir a futuro
  return (
    <div
      aria-busy="true"
      aria-label="Cargando página"
      className="mx-auto w-full max-w-7xl animate-pulse px-4 py-6 sm:px-6"
    >
      <div className="h-8 w-48 rounded-md bg-muted" />
      <div className="mt-2 h-4 w-72 rounded-md bg-muted" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-80 rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
};
