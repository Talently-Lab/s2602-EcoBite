import { CategoriaRestaurante } from '../generated/prisma/enums';

export const categoriaLabels: Record<CategoriaRestaurante, string> = {
  COMIDA_SALUDABLE: 'Comida saludable',
  COMIDA_DE_ESTACION: 'Comida de estación',
  COMIDA_VEGANA: 'Comida vegana',
  COMIDA_CASERA: 'Comida casera',
};

// Case- and accent-insensitive lookup so analyst CSV labels map to the enum.
function foldLabel(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').trim().toLowerCase();
}

const categoriaByLabel = new Map(
  (Object.entries(categoriaLabels) as [CategoriaRestaurante, string][]).map(
    ([categoria, label]) => [foldLabel(label), categoria],
  ),
);

export function categoriaFromLabel(value: string): CategoriaRestaurante | null {
  return categoriaByLabel.get(foldLabel(value)) ?? null;
}
