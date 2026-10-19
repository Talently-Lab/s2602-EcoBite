import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/PasswordField";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin } from "@/hooks/useAuth";
import { loginSchema, type Login } from "@/schemas/auth.schema";
import { useNavigate } from "react-router-dom";

type props = {
  onSwitchToRegister: () => void;
};

export const LoginForm = ({ onSwitchToRegister }: props) => {
  const [remembered, setRemembered] = useState<boolean>(false);
  const login = useLogin();
  const navigate = useNavigate()

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
        navigate('/home')
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
    <section className="min-h-153.25 flex flex-col justify-center w-full rounded-lg border bg-card px-6 py-8 shadow-xs sm:px-12">
      <p className="text-[17px] font-medium text-primary">¿Ya tenés cuenta?</p>
      <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight">
        Iniciá sesión
      </h1>
      <p className="text-xs font-bold text-[#026129]">
        Iniciá sesión y seguí descubriendo opciones para comer rico y elegir mejor.
      </p>
      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {errors.root?.server && (
          <p role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
            {errors.root.server.message}
          </p>
        )}
        <div>
          <label htmlFor="login-username" className="mb-1.5 block text-xs font-bold text-foreground">
            Email
          </label>
          <Input
            id="login-username"
            type="email"
            autoComplete="email"
            placeholder="tunombre@ejemplo.com"
            aria-invalid={errors.email ? true : undefined}
            className="h-10 border-ring/60 bg-card"
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

        <div className="mt-4 mb-10 flex items-center justify-between text-xs">
          <label
            htmlFor="login-remembered"
            className="flex cursor-pointer items-center gap-1.5 font-medium text-foreground"
          >
            <input
              id="login-remembered"
              name="remembered"
              type="checkbox"
              checked={remembered}
              onChange={(e) => setRemembered(e.target.checked)}
              className="size-3.5 cursor-pointer accent-primary"
            />
            Recordarme
          </label>
          <button
            type="button"
            className="cursor-pointer font-medium text-foreground transition-colors hover:text-primary"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <Button
          type="submit"
          disabled={login.isPending}
          className="h-10 w-full rounded-md font-semibold"
        >
          {login.isPending ? "Iniciando sesión…" : "Iniciá sesión"}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-[#7D7D7D]">
        ¿No tenés cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="cursor-pointer font-bold text-primary underline-offset-4 hover:underline"
        >
          Creá la tuya.
        </button>
      </p>
    </section>
  );
};
