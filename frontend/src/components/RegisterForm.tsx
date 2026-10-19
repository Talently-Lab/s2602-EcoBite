import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/PasswordField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "@/hooks/useAuth";
import { registerSchema, type RegisterFormValues } from "@/schemas/auth.schema";
import { useNavigate } from "react-router-dom";

type props = {
  onSwitchToLogin: () => void;
};

export const RegisterForm = ({ onSwitchToLogin }: props) => {
  const registerHook = useRegister();
  const navigate = useNavigate();

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
          navigate('/home')
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
    <section className="min-h-153.25 w-full rounded-lg border border-green-dark/50 bg-card px-6 py-8 shadow-xs sm:px-12">
      <p className="text-xs font-bold text-[#026129] max-w-70">
        Creá tu cuenta y descubrí restaurantes locales con opciones de delivery de menor impacto ambiental.
      </p>
      <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight">
        Crear mi cuenta
      </h1>
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
          <label htmlFor="register-email" className="mb-1.5 block text-xs font-bold text-foreground">
            Email
          </label>
          <Input
            id="register-email"
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

        <div>
          <label htmlFor="register-username" className="mb-1.5 block text-xs font-bold text-foreground">
            Usuario
          </label>
          <Input
            id="register-username"
            type="text"
            autoComplete="username"
            placeholder="¿Cómo te llamás?"
            aria-invalid={errors.name ? true : undefined}
            className="h-10 border-ring/60 bg-card"
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
          label="Contraseña"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          error={errors.password?.message}
          {...register("password")}
        />

        <PasswordField
          id="register-confirm-password"
          label="Confirmar contraseña"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          disabled={registerHook.isPending}
          className="mt-6 h-10 w-full rounded-md font-semibold"
        >
          {registerHook.isPending ? "Creando cuenta…" : "Register"}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-[#7D7D7D]">
        ¿Ya tenés cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="cursor-pointer font-bold text-primary underline-offset-4 hover:underline"
        >
          Creá la tuya.
        </button>
      </p>
    </section>
  );
};
