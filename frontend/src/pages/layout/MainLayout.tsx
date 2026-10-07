import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";

type MainLayoutProps = {
  children: ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <section className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {children}
      </div>
    </section>
  );
};
