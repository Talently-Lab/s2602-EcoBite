import type { Login, Register } from "@/schemas/auth.schema";
import { getProfile, login, register } from "@/services/auth.service";
import { useAuthStore } from "@/context/auth-store";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useProfile() {
  const session = useAuthStore((s) => s.session);
  return useQuery({
    queryKey: ["profile", session?.user.id, session?.accessToken],
    queryFn: () => getProfile(session!.accessToken),
    enabled: Boolean(session),
  });
}

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
