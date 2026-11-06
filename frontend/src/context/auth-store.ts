import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { LoginResponse, StoredSession } from "@/types/auth";

type AuthState = {
  session: StoredSession | null;
  setSession: (data: LoginResponse) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: ({ accessToken, user, expiresIn }) =>
        set({
          session: {
            accessToken,
            user,
            expiresAt: Date.now() + expiresIn * 1000,
          },
        }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: "ecobite.session",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ session: state.session }),
    },
  ),
);

export const isAuthenticated = () => {
  const { session, clearSession } = useAuthStore.getState();

  if (!session || session.expiresAt <= Date.now()) {
    clearSession();
    return false;
  }

  return true;
};
