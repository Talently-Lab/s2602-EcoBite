import { useState } from "react";
import { Input } from "./ui/input";
import { Eye, EyeOff } from "lucide-react";

type props = {
  id: string;
  name: string;
  label: string;
  autoComplete?: string;
  placeholder?: string;
};

export const PasswordField = ({
  id,
  name,
  label,
  autoComplete = "current-password",
  placeholder = "Enter your password",
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
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          placeholder={placeholder}
          className="h-10 border-green-dark/50 bg-card pr-10"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute inset-y-0 right-3 flex cursor-pointer items-center text-primary transition-colors"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
};
