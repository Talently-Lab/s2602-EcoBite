import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/PasswordField";

type props = {
  onSwitchToRegister: () => void;
};

export const LoginForm = ({ onSwitchToRegister }: props) => {
  const [remembered, setRemembered] = useState<boolean>(false);

  return (
    <section className="min-h-153.25 flex flex-col justify-center w-full rounded-lg border border-green-dark/50 bg-card px-6 py-8 shadow-xs sm:px-12">
      <p className="text-[17px] font-medium text-primary">Bienvenidos</p>
      <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight">
        Sign in to
      </h1>
      <p className="text-base font-medium text-primary">
        Lorem Ipsum is simply
      </p>
      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label htmlFor="login-username" className="mb-1.5 block text-xs font-bold text-foreground">
            User Name
          </label>
          <Input
            id="login-username"
            name="username"
            type="text"
            autoComplete="username"
            required
            placeholder="Enter your user name"
            className="h-10 border-green-dark/50 bg-card"
          />
        </div>
        <PasswordField
          id="login-password"
          name="password"
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
        />

        <div className="flex items-center justify-between text-xs">
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
            Remembered
          </label>
          <button
            type="button"
            className="cursor-pointer font-medium text-foreground transition-colors hover:text-primary"
          >
            Forgot Password ?
          </button>
        </div>

        <Button
          type="submit"
          className="mt-2 h-10 w-full rounded-md font-semibold"
        >
          Login
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-[#7D7D7D]">
        Don&apos;t have an Account ?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="cursor-pointer font-bold text-primary underline-offset-4 hover:underline"
        >
          Register
        </button>
      </p>
    </section>
  );
};
