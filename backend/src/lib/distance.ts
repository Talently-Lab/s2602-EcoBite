import { Prisma } from '../generated/prisma/client';

// Same-zone deliveries still report a nominal 0.50 km so distance and CO2 never
// read as zero for a real delivery.
export const SAME_ZONE_DISTANCE_KM = new Prisma.Decimal('0.50');

type ZoneCentroid = { latitud: Prisma.Decimal; longitud: Prisma.Decimal };

// Straight-line distance between zone centroids (GCBA barrios.geojson), Earth
// radius 6371 km, rounded to 2 decimals for storage in Decimal(5,2).
export function haversineKm(origin: ZoneCentroid, destination: ZoneCentroid): Prisma.Decimal {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const lat1 = toRadians(origin.latitud.toNumber());
  const lat2 = toRadians(destination.latitud.toNumber());
  const dLat = lat2 - lat1;
  const dLon = toRadians(destination.longitud.toNumber() - origin.longitud.toNumber());
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const km = 2 * 6371 * Math.asin(Math.sqrt(a));
  return new Prisma.Decimal(km).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}
