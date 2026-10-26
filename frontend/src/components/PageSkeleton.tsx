export const PageSkeleton = () => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando página"
      className="flex min-h-dvh w-full flex-col items-center justify-center gap-6 bg-[#FFFFFF] px-4"
    >
      <div className="relative size-50">
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="absolute inset-0 size-full animate-spin"
          style={{ animationDuration: "2.6s" }}
        >
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="180 96"
            className="stroke-[#00733D]"
          />
        </svg>
        <img
          src="/images/logo-eco-04.png"
          alt=""
          width={136}
          height={136}
          className="absolute top-1/2 left-1/2 size-34 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full object-cover"
        />
      </div>

      <p
        aria-hidden="true"
        className="flex items-center gap-1.5 text-lg font-medium text-[#2C2C2A]"
      >
        Cargando
        <span className="flex items-end gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="loader-dot size-3 rounded-full bg-[#00733D]"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      </p>
    </div>
  );
};
