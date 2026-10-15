import { Search } from "lucide-react";
import { Input } from "./ui/input";

export const Footer = () => {
  return (
    <footer className="w-full bg-[#545454] text-white dark:bg-[#121917]">
      <div className="relative mx-auto w-full max-w-7xl overflow-hidden px-4 py-10 sm:px-6 md:py-14">
        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between md:gap-6">
          {/* Izquierda: texto + buscador */}
          <div className="sm:max-w-xs shrink-0">
            <p className="text-[13px] leading-relaxed text-white/90">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              ornare cursus sed nunc eget dictum. Sed ornare cursus sed nunc
              eget dictumd nunc eget dictum. Sed ornare cursus sed nunc eget
              dictum
            </p>

            <form
              role="search"
              className="relative mt-8 w-56 max-w-full"
              onSubmit={(e) => e.preventDefault()}
            >
              <label htmlFor="footer-search" className="sr-only">
                Buscar
              </label>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[#545454]"
              />
              <Input
                id="footer-search"
                type="search"
                placeholder="Ejemplo"
                className="h-8 rounded-xs border-0 bg-white pr-2.5 pl-8 text-xs text-neutral-900 placeholder:text-[#ABABAB] dark:bg-white dark:text-neutral-900"
              />
            </form>
          </div>

          {/* Derecha: marca de agua */}
          <div
            aria-hidden="true"
            className="pointer-events-none flex flex-1 items-center sm:justify-center select-none md:justify-end"
          >
            <img
              src="/images/logo-eco-03.png"
              alt=""
              width={640}
              height={162}
              loading="lazy"
              className="w-full max-w-md opacity-15 grayscale md:max-w-2xl"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
