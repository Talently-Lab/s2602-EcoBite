import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";
import { MainLayout } from "@/pages/layout/MainLayout";
import { LoginForm } from "@/components/LoginForm";
import { RegisterForm } from "@/components/RegisterForm";

type AuthMode = "login" | "register";

const VISUALS: Record<AuthMode, { src: string; alt: string }> = {
  login: {
    src: "/images/image-login.webp",
    alt: "Repartidor sosteniendo cajas y café",
  },
  register: {
    src: "/images/image-register.webp",
    alt: "Repartidor en bicicleta entregando una bolsa de papel",
  },
};

const Auth = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode: AuthMode = searchParams.get("mode") === "register" ? "register" : "login";
  const setMode = (nextMode: AuthMode) => setSearchParams(nextMode === "register" ? { mode: nextMode } : {});
  const visual = VISUALS[mode];

  return (
    <MainLayout>
      <section className="flex items-center justify-center bg-white px-4 py-10 text-foreground">
        <div className="grid w-full max-w-[1200px] items-start gap-6 lg:grid-cols-[minmax(0,486fr)_minmax(0,688fr)]">
          {mode === "login" ? (
            <LoginForm onSwitchToRegister={() => setMode("register")} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setMode("login")} />
          )}

          {/* Panel visual */}
          <section className={cn("flex w-full flex-col items-center", mode === "register" && "lg:pt-1")}>
            <img
              src={visual.src}
              alt={visual.alt}
              className="block w-full object-cover"
            />
            <h2 className={cn("mt-8 text-center text-3xl font-bold leading-tight tracking-tight text-black lg:text-[40px]", mode === "register" && "lg:mt-14")}>
              El sabor del impacto
            </h2>
            <p className="text-xl leading-tight text-[#00733D] lg:text-[26px]">Cada pedido cuenta.</p>
          </section>
        </div>
      </section>
    </MainLayout>
  );
};

export default Auth;
