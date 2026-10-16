import { useState } from "react";
import type { ComponentProps } from "react";
import { Input } from "./ui/input";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type props = {
  id: string;
  label: string;
  error?: string;
} & ComponentProps<"input">;

export const PasswordField = ({
  id,
  label,
  error,
  autoComplete = "current-password",
  placeholder = "Enter your password",
  className,
  ...inputProps
}: props) => {
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-foreground">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          className={cn("h-10 border-green-dark/50 bg-card pr-10", className)}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className={cn(
            "absolute inset-y-0 right-3 flex cursor-pointer items-center transition-colors",
            error ? "text-destructive" : "text-primary",
          )}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
};
