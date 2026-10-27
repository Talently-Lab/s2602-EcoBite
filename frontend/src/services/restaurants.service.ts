import type { RestaurantDetail } from "@/types/restaurant";

const API_URL = import.meta.env.VITE_API_URL;

export const getRestaurants = async () => {
  const response = await fetch(`${API_URL}/restaurants`);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Error al cargar restaurantes");
  }

  const data = await response.json();
  return data;
};

export const getRestaurantById = async (id: string) => {
  const response = await fetch(`${API_URL}/restaurants/${id}`);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Error al cargar el restaurante");
  }

  const data: RestaurantDetail = await response.json();
  return data;
};
