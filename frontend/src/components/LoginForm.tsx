import { useState } from "react";
import { ChevronsLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/PasswordField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/hooks/useAuth";
import { loginSchema, type Login } from "@/schemas/auth.schema";
import { Link, useLocation, useNavigate } from "react-router-dom";

type props = {
  onSwitchToRegister: () => void;
};

export const LoginForm = ({ onSwitchToRegister }: props) => {
  const [remembered, setRemembered] = useState<boolean>(false);
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? "/catalog";

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<Login>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: Login) => {
    if (login.isPending) return;
    clearErrors("root.server");
    login.mutate(data, {
      onSuccess: () => {
        navigate(redirectTo)
      },
      onError: (error) => {
        setError("root.server", {
          type: "server",
          message: error.message,
        });
      },
    });
  };

  return (
    <section className="relative flex min-h-[740px] w-full flex-col rounded-lg border border-[#00733D]/50 bg-white px-6 pt-16 pb-16 shadow-[0_0_48px_0_#00000008] sm:px-[77px] sm:pt-25 sm:pb-26">
      <Link to="/home" aria-label="Volver al inicio" className="mb-4 w-fit rounded-sm text-[#008647] focus-visible:outline-2 focus-visible:outline-offset-4 sm:absolute sm:top-[60px] sm:left-6 sm:mb-0">
        <ChevronsLeft aria-hidden="true" className="size-6" />
      </Link>
      <p className="text-[26px] leading-8 text-[#00733D]">¿Ya tenés cuenta?</p>
      <h1 className="mt-4 text-[32px] font-bold leading-[48px] tracking-tight text-black sm:text-[40px]">
        Iniciá sesión
      </h1>
      <p className="text-sm font-bold leading-[17px] text-[#026129]">
        Comé rico. Elegí mejor.
      </p>
      <form
        className="mt-12 flex flex-col gap-5 [&_label]:text-sm [&_input:not([type=checkbox])]:h-[50px] [&_input:not([type=checkbox])]:rounded-md [&_input:not([type=checkbox])]:px-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {errors.root?.server && (
          <p role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
            {errors.root.server.message}
          </p>
        )}
        <div>
          <label htmlFor="login-username" className="mb-2 block text-sm font-bold text-[#000000]">
            Email
          </label>
          <Input
            id="login-username"
            type="email"
            autoComplete="email"
            placeholder="tunombre@ejemplo.com"
            aria-invalid={errors.email ? true : undefined}
            className="h-10 border-[#00733D]/50 bg-[#FFFFFF]"
            {...register("email")}
          />
          {errors.email && (
            <p role="alert" className="mt-1.5 text-xs font-medium text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
        <PasswordField
          id="login-password"
          label="Contraseña"
          autoComplete="current-password"
          placeholder="Mínimo 8 caracteres"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="mt-3 mb-10 flex flex-wrap items-center justify-between gap-3 text-[13px]">
          <label
            htmlFor="login-remembered"
            className="flex cursor-pointer items-center gap-4 text-[13px]! font-normal text-[#000000]"
          >
            <input
              id="login-remembered"
              name="remembered"
              type="checkbox"
              checked={remembered}
              onChange={(e) => setRemembered(e.target.checked)}
              className="size-3 shrink-0 cursor-pointer appearance-none rounded-none border border-[#00733D]/50 bg-[#FFFFFF] bg-center bg-no-repeat transition-colors hover:border-[#009951] focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:outline-none checked:border-[#009951] checked:bg-[#009951] checked:bg-size-[70%] checked:bg-[url(data:image/svg+xml,%3Csvg%20xmlns=%22http:%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22white%22%20stroke-width=%223.5%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3E%3Cpath%20d=%22M20%206%209%2017l-5-5%22%2F%3E%3C%2Fsvg%3E)]"
            />
            Recordarme
          </label>
          <button
            type="button"
            className="cursor-pointer font-medium text-[#4D4D4D]"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <Button
          type="submit"
          disabled={login.isPending}
          className="h-9 w-full rounded-lg bg-[#009951]! text-sm font-bold text-white!"
        >
          {login.isPending ? "Iniciando sesión…" : "Iniciá sesión"}
        </Button>
      </form>

      <p className="mt-3 text-center text-sm font-bold text-[#808080]">
        ¿Todavía no tenés cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="cursor-pointer font-bold text-[#808080] underline-offset-4 hover:underline"
        >
          Creá la tuya.
        </button>
      </p>
    </section>
  );
};
