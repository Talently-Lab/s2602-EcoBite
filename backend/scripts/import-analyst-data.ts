import { resolve } from 'node:path';
import type { PrismaClient } from '../src/generated/prisma/client';
import { ImportValidationError, loadDataset, normalizeName, sheets, validateDataset, type Dataset } from './analyst-csv';
import { prepareImport } from './analyst-plan';

async function insertMissing<T extends { id?: string }>(
  rows: T[],
  existing: (ids: string[]) => Promise<{ id: string }[]>,
  insert: (rows: T[]) => Promise<{ count: number }>,
): Promise<number> {
  const ids = rows.map((row) => row.id!);
  const found = new Set((await existing(ids)).map((row) => row.id));
  const pending = rows.filter((row) => !found.has(row.id!));
  return pending.length ? (await insert(pending)).count : 0;
}

export type ImportCounts = {
  restaurantes: number; usuarios: number; productos: number;
  pedidos: number; detalles: number; productoEmpaque: number;
  usuariosReconciliados?: number;
};

export async function importDataset(db: PrismaClient, source: Dataset, reconcile = false) {
  const { data } = validateDataset(source);
  // All reference resolution, inserts and uniqueness checks share one rollback boundary.
  return db.$transaction(async (tx) => {
    const zones = await tx.zona.findMany({ select: { id: true, nombreBarrio: true, distanciaPromedioKm: true } });
    const packaging = await tx.empaque.findMany({ select: { id: true, nombreEnvase: true, gramosPlasticoEvitados: true } });
    const plan = prepareImport(data,
      new Map(zones.map((row) => [normalizeName(row.nombreBarrio), row.id])),
      new Map(packaging.map((row) => [normalizeName(row.nombreEnvase), row.id])),
    );
    for (const row of data.Zonas) {
      const existing = zones.find((zone) => normalizeName(zone.nombreBarrio) === normalizeName(row.nombre_barrio))!;
      if (!existing.distanciaPromedioKm.equals(row.distancia_promedio_km.replace(',', '.'))) {
        throw new ImportValidationError(['Zonas: seeded distance differs from CSV; review references before import']);
      }
    }
    for (const row of data.Empaques) {
      const existing = packaging.find((pack) => normalizeName(pack.nombreEnvase) === normalizeName(row.nombre_envase))!;
      if (!existing.gramosPlasticoEvitados.equals(row.gramos_plastico_evitados.replace(',', '.'))) {
        throw new ImportValidationError(['Empaques: seeded grams differ from CSV; review references before import']);
      }
    }
    // usuario.id_restaurante is an FK, so restaurantes must land first.
    const counts: ImportCounts = {
      restaurantes: await insertMissing(plan.restaurantes,
        (ids) => tx.restaurante.findMany({ where: { id: { in: ids } }, select: { id: true } }),
        (rows) => tx.restaurante.createMany({ data: rows })),
      usuarios: await insertMissing(plan.usuarios,
        (ids) => tx.usuario.findMany({ where: { id: { in: ids } }, select: { id: true } }),
        (rows) => tx.usuario.createMany({ data: rows })),
      productos: await insertMissing(plan.productos,
        (ids) => tx.producto.findMany({ where: { id: { in: ids } }, select: { id: true } }),
        (rows) => tx.producto.createMany({ data: rows })),
      pedidos: await insertMissing(plan.pedidos,
        (ids) => tx.pedido.findMany({ where: { id: { in: ids } }, select: { id: true } }),
        (rows) => tx.pedido.createMany({ data: rows })),
      detalles: await insertMissing(plan.detalles,
        (ids) => tx.detalle.findMany({ where: { id: { in: ids } }, select: { id: true } }),
        (rows) => tx.detalle.createMany({ data: rows })),
      productoEmpaque: 0,
    };
    const existing = await tx.productoEmpaque.findMany({
      where: { productoId: { in: plan.productos.map((row) => row.id!) } },
      select: { productoId: true, empaqueId: true },
    });
    const pairs = new Set(existing.map((row) => `${row.productoId}/${row.empaqueId}`));
    const pending = plan.productoEmpaque.filter((row) => !pairs.has(`${row.productoId}/${row.empaqueId}`));
    if (pending.length) counts.productoEmpaque = (await tx.productoEmpaque.createMany({ data: pending })).count;
    if (!reconcile) return counts;
    // Dataset UUIDs are deterministic (sourceId), so a registered account can
    // never be in this set; reconcile only fixes rol/restauranteId on those rows.
    const planned = new Map(plan.usuarios.map((row) => [row.id!, row]));
    let usuariosReconciliados = 0;
    for (const row of await tx.usuario.findMany({
      where: { id: { in: [...planned.keys()] } },
      select: { id: true, rol: true, restauranteId: true },
    })) {
      const target = planned.get(row.id)!;
      const restauranteId = target.restauranteId ?? null;
      if (row.rol === target.rol && row.restauranteId === restauranteId) continue;
      usuariosReconciliados += (await tx.usuario.updateMany({
        where: { id: row.id },
        data: { rol: target.rol, restauranteId },
      })).count;
    }
    return { ...counts, usuariosReconciliados };
  }, { timeout: 120000, isolationLevel: 'Serializable' });
}

export async function main(args = process.argv.slice(2)) {
  const flags = args.filter((arg) => arg !== '--');
  if (flags.some((arg) => !['--dry-run', '--apply', '--reconcile', '--help'].includes(arg)) ||
      (flags.includes('--apply') && flags.includes('--dry-run'))) {
    throw new ImportValidationError(['Usage: data:import [--dry-run | --apply [--reconcile]]; default is validation only']);
  }
  if (flags.includes('--reconcile') && !flags.includes('--apply')) {
    throw new ImportValidationError(['--reconcile requires --apply: it writes rol/id_restaurante fixes on dataset accounts']);
  }
  if (flags.includes('--help')) {
    console.log('data:import [--dry-run | --apply [--reconcile]]; ANALYST_DATA_DIR overrides backend/prisma/data');
    return;
  }
  const source = loadDataset(resolve(process.env.ANALYST_DATA_DIR ?? resolve(__dirname, '../prisma/data')));
  const { data, excludedCouriers } = validateDataset(source);
  for (const sheet of sheets) console.log(`${sheet}: ${data[sheet].length} validated rows`);
  console.log(`REPARTIDOR: ${excludedCouriers} accounts excluded by approved MVP policy`);
  console.log('User password hashes are preserved; SHA-256 demo accounts cannot use bcrypt login.');
  if (!flags.includes('--apply')) {
    console.log('PASS: validation only; no database connection or writes. Use --apply explicitly to import.');
    return;
  }
  const { prisma } = await import('../src/lib/prisma.js');
  try {
    const counts = await importDataset(prisma, source, flags.includes('--reconcile'));
    console.log('Committed inserts (existing IDs are left unchanged):', JSON.stringify(counts));
    if ('usuariosReconciliados' in counts) console.log(`usuarios reconciliados: ${counts.usuariosReconciliados}`);
  } finally {
    await prisma.$disconnect();
  }
}

export function safeDatabaseFailure(error: unknown): string {
  // Never emit the driver's message, metadata, input row or connection string.
  if (error && typeof error === 'object' && 'code' in error) {
    if (error.code === 'P2002') return 'P2002: unique-key conflict; no partial import committed. Review existing IDs/emails; accounts are never merged.';
    if (error.code === 'P2034') return 'P2034: concurrent transaction conflict; no partial import committed. Validate and retry.';
    if (error.code === 'P2028') return 'P2028: transaction timed out or closed; check connectivity before retrying.';
  }
  return 'Import failed; check database access, migrations, reference seed and unique constraints. No partial import is committed.';
}

if (require.main === module) {
  main().catch((error: unknown) => {
    if (error instanceof ImportValidationError) {
      const groups = new Map<string, number>();
      for (const issue of error.issues) {
        const key = issue.replace(/row \d+:/, 'rows:');
        groups.set(key, (groups.get(key) ?? 0) + 1);
      }
      for (const [issue, count] of groups) console.error(`${count}x ${issue}`);
    } else {
      console.error(safeDatabaseFailure(error));
    }
    process.exitCode = 1;
  });
}
