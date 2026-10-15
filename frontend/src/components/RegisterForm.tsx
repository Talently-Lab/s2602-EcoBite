import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/PasswordField";

type props = {
  onSwitchToLogin: () => void;
};

export const RegisterForm = ({ onSwitchToLogin }: props) => {
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
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label htmlFor="register-email" className="mb-1.5 block text-xs font-bold text-foreground">
            Email
          </label>
          <Input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="tunombre@ejemplo.com"
            className="h-10 border-green-dark/50 bg-card"
          />
        </div>

        <div>
          <label htmlFor="register-username" className="mb-1.5 block text-xs font-bold text-foreground">
            Usuario
          </label>
          <Input
            id="register-username"
            name="username"
            type="text"
            autoComplete="username"
            required
            placeholder="¿Cómo te llamás?"
            className="h-10 border-green-dark/50 bg-card"
          />
        </div>

        <PasswordField
          id="register-password"
          name="password"
          label="Contraseña"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
        />

        <PasswordField
          id="register-confirm-password"
          name="confirm-password"
          label="Confirmar contraseña"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
        />

        <Button
          type="submit"
          className="mt-6 h-10 w-full rounded-md font-semibold"
        >
          Register
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
