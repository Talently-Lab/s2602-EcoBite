import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/PasswordField";

type props = {
  onSwitchToLogin: () => void;
};

export const RegisterForm = ({ onSwitchToLogin }: props) => {
  return (
    <section className="min-h-153.25 w-full rounded-lg border border-green-dark/50 bg-card px-6 py-8 shadow-xs sm:px-12">
      <p className="text-[17px] font-medium text-primary">Bienvenidos</p>
      <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight">
        Sign up to
      </h1>
      <p className="text-base font-medium text-primary">
        Lorem Ipsum is simply
      </p>
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
            placeholder="Enter your user name"
            className="h-10 border-green-dark/50 bg-card"
          />
        </div>

        <div>
          <label htmlFor="register-username" className="mb-1.5 block text-xs font-bold text-foreground">
            User name
          </label>
          <Input
            id="register-username"
            name="username"
            type="text"
            autoComplete="username"
            required
            placeholder="Enter your user name"
            className="h-10 border-green-dark/50 bg-card"
          />
        </div>

        <PasswordField
          id="register-password"
          name="password"
          label="Password"
          autoComplete="new-password"
          placeholder="Enter your user name"
        />

        <PasswordField
          id="register-confirm-password"
          name="confirm-password"
          label="Confirm your password"
          autoComplete="new-password"
          placeholder="Enter your user name"
        />

        <Button
          type="submit"
          className="mt-6 h-10 w-full rounded-md font-semibold"
        >
          Register
        </Button>
      </form>

      <p className="mt-4 text-xs leading-relaxed text-[#7D7D7D]">
        Already have an Account ?<br />
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="cursor-pointer font-bold text-primary underline-offset-4 hover:underline"
        >
          Login
        </button>
      </p>
    </section>
  );
};
