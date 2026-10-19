import type { Login, Register } from "@/schemas/auth.schema";

const API_URL = import.meta.env.VITE_API_URL;

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

export const login = async (payload: Login) => {
  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Error al iniciar sesión");

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Error al iniciar sesión");
  }
};
