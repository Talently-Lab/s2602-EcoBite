import { ChevronsLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/PasswordField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "@/hooks/useAuth";
import { registerSchema, type RegisterFormValues } from "@/schemas/auth.schema";

type props = {
  onSwitchToLogin: () => void;
};

export const RegisterForm = ({ onSwitchToLogin }: props) => {
  const registerHook = useRegister();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormValues) => {
    if (registerHook.isPending) return;
    clearErrors("root.server");
    registerHook.mutate(
      { name: data.name, email: data.email, password: data.password },
      {
        onSuccess: () => {
          onSwitchToLogin()
        },
        onError: (error) => {
          setError("root.server", {
            type: "server",
            message: error.message,
          });
        },
      },
    );
  };

  return (
    <section className="relative flex min-h-[740px] w-full flex-col rounded-lg border border-[#00733D]/50 bg-white px-6 py-10 shadow-[0_0_48px_0_#00000008] sm:px-[77px] sm:py-14">
      <Link to="/home" aria-label="Volver al inicio" className="mb-4 w-fit rounded-sm text-[#008647] focus-visible:outline-2 focus-visible:outline-offset-4 sm:absolute sm:top-[60px] sm:left-6 sm:mb-0">
        <ChevronsLeft aria-hidden="true" className="size-6" />
      </Link>
      <p className="max-w-[330px] text-sm leading-[17px] text-[#00733D]">
        Creá tu cuenta y descubrí restaurantes locales con opciones de delivery de menor impacto ambiental.
      </p>
      <h1 className="mt-1 text-[32px] font-bold leading-[48px] tracking-tight text-black sm:text-[40px]">
        Crear mi cuenta
      </h1>
      <form
        className="mt-10 flex flex-1 flex-col gap-6 sm:mt-12 [&_label]:text-sm [&_input]:h-12 [&_input]:rounded-md [&_input]:px-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {errors.root?.server && (
          <p role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
            {errors.root.server.message}
          </p>
        )}
        <div>
          <label htmlFor="register-email" className="mb-2 block text-sm font-bold text-[#000000]">
            Email
          </label>
          <Input
            id="register-email"
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

        <div>
          <label htmlFor="register-username" className="mb-2 block text-sm font-bold text-[#000000]">
            Nombre
          </label>
          <Input
            id="register-username"
            type="text"
            autoComplete="name"
            placeholder="¿Cómo te llamás?"
            aria-invalid={errors.name ? true : undefined}
            className="h-10 border-[#00733D]/50 bg-[#FFFFFF]"
            {...register("name")}
          />
          {errors.name && (
            <p role="alert" className="mt-1.5 text-xs font-medium text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

        <PasswordField
          id="register-password"
          className="h-12"
          label="Contraseña"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          error={errors.password?.message}
          {...register("password")}
        />

        <PasswordField
          id="register-confirm-password"
          className="h-12"
          label="Confirmar contraseña"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          disabled={registerHook.isPending}
          className="mt-auto h-8 w-full rounded-lg bg-[#009951]! text-sm font-bold text-white!"
        >
          {registerHook.isPending ? "Creando cuenta…" : "Registrarme"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-black">
        ¿Ya tenés cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="cursor-pointer font-bold text-[#00733D] underline-offset-4"
        >
          Iniciá sesión
        </button>
      </p>
    </section>
  );
};
