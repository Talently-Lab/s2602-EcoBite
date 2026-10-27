import type { ZoneDetail } from "@/types/restaurant";

const API_URL = import.meta.env.VITE_API_URL;

export const getZones = async (): Promise<ZoneDetail[]> => {
  const response = await fetch(`${API_URL}/zones`);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Error al cargar las zonas");
  }

  const data: ZoneDetail[] = await response.json();
  return data;
};
