import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email("Ingresá un email válido.")
    .trim()
    .toLowerCase()
    .max(254, "El email no puede superar los 254 caracteres."),
  password: z
    .string("La contraseña es obligatoria.")
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(72, "La contraseña no puede superar los 72 caracteres."),
});

export const registerSchema = loginSchema
  .extend({
    name: z
      .string("El nombre es obligatorio.")
      .trim()
      .min(1, "El nombre es obligatorio.")
      .max(120, "El nombre no puede superar los 120 caracteres.")
      .regex(
        /^[^\u0000-\u001f\u007f]*$/,
        "El nombre contiene caracteres no válidos.",
      ),
    confirmPassword: z.string("Confirmá tu contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type Login = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type Register = Omit<RegisterFormValues, "confirmPassword">;
