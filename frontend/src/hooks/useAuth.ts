import type { Login, Register } from "@/schemas/auth.schema";
import { login, register } from "@/services/auth.service";
import { useAuthStore } from "@/context/auth-store";
import { useMutation } from "@tanstack/react-query";

export function useRegister() {
  return useMutation({
    mutationFn: (payload: Register) => register(payload)
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (payload: Login) => login(payload),
    onSuccess: (data) => {
      useAuthStore.getState().setSession(data);
    },
  })
}