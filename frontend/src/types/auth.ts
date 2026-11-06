export type AuthRole =
  | "CLIENTE"
  | "ADMIN_PLATAFORMA"
  | "RESTAURANTE_ADMIN";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  createdAt: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: AuthUser;
};

export type StoredSession = {
  accessToken: string;
  user: AuthUser;
  expiresAt: number;
};
