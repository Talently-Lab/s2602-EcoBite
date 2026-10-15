import { useState } from "react";
import { LoginForm } from "@/components/LoginForm";
import { RegisterForm } from "@/components/RegisterForm";

type AuthMode = "login" | "register";

const VISUALS: Record<AuthMode, { src: string; alt: string }> = {
  login: {
    src: "/images/image-login.png",
    alt: "Repartidor sosteniendo cajas y café",
  },
  register: {
    src: "/images/image-register.png",
    alt: "Repartidor en bicicleta entregando una bolsa de papel",
  },
};

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const visual = VISUALS[mode];

  return (
    <section className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="grid w-full max-w-5xl items-start gap-6 md:grid-cols-[420px_1fr]">
        {mode === "login" ? (
          <LoginForm onSwitchToRegister={() => setMode("register")} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setMode("login")} />
        )}

        {/* Panel visual */}
        <section className="flex w-full flex-col items-center">
          <img
            src={visual.src}
            alt={visual.alt}
            className="block max-h-135.5 w-full object-cover"
          />
          <h2 className="mt-8 text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
            Comé rico. Elegí un cambio.
          </h2>
        </section>
      </div>
    </section>
  );
};

export default Auth;
