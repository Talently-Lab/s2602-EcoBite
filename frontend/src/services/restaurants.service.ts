import { MOCK_RESTAURANTS } from "@/lib/mocks";

const API_URL = import.meta.env.VITE_API_URL;

export const getRestaurants = async () => {
  try {
    const response = await fetch(`${API_URL}/restaurants`);
    if (!response.ok) throw new Error("Error al cargar restaurantes");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return MOCK_RESTAURANTS;
  }
};
