import { z } from "zod";

const API_URL = import.meta.env.VITE_API_URL;
const zonesSchema = z.array(z.object({ id: z.uuid(), name: z.string(), distanceKm: z.number().finite().nonnegative() }));

export const getDeliveryZones = async () => {
  const response = await fetch(`${API_URL}/zones`);
  if (!response.ok) throw new Error("No pudimos cargar los barrios de entrega.");
  return zonesSchema.parse(await response.json());
};
