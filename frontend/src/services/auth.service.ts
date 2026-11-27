import type { Login, Register } from "@/schemas/auth.schema";
import type { LoginResponse } from "@/types/auth";
import { z } from "zod";

const API_URL = import.meta.env.VITE_API_URL;

const profileSchema = z.object({
  name: z.string(),
  address: z.string().nullable(),
  habitualZone: z.object({ id: z.uuid(), name: z.string() }).nullable(),
});

export const getProfile = async (accessToken: string) => {
  const response = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("No pudimos cargar tu dirección guardada. Podés escribirla manualmente.");
  const data = await response.json();
  const profile = profileSchema.safeParse(data.user);
  if (!profile.success) {
    throw new Error("No pudimos cargar tu dirección guardada. Podés escribirla manualmente.");
  }
  return profile.data;
};

export const register = async (payload: Register) => {
  try {
    const response = await fetch(`${API_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      if (response.status === 409) {
        throw new Error("Ese correo ya está registrado");
      }
      if (response.status === 500) {
        throw new Error("Error de red");
      }
      throw new Error(body?.error);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const login = async (payload: Login): Promise<LoginResponse> => {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error("Error de servidor", { cause: error });
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Correo o contraseña inválidos");
    }

    throw new Error("Error de servidor");
  }

  try {
    return (await response.json()) as LoginResponse;
  } catch (error) {
    throw new Error("Error de servidor", { cause: error });
  }
};
