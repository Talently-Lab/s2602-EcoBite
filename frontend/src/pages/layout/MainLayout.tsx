import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

type MainLayoutProps = {
  children: ReactNode;
  spacious?: boolean;
};

export const MainLayout = ({ children, spacious = false }: MainLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFFFFF] text-foreground">
      <a href="#main-content" className="sr-only z-70 bg-white p-3 text-black focus:not-sr-only focus:fixed">Saltar al contenido</a>
      <Navbar />
      <main id="main-content" className={cn("mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6", spacious && "max-w-[1248px] pt-10 pb-24")}>
        {children}
      </main>
      <Footer />
    </div>
  );
};
