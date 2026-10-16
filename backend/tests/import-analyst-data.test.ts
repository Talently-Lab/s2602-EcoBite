import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { promisify } from 'node:util';
import { EstadoPedido, RolUsuario } from '../src/generated/prisma/enums';
import { ImportValidationError, loadDataset, parseCsv, validateDataset, type Dataset, type Sheet } from '../scripts/analyst-csv';
import { prepareImport, sourceId } from '../scripts/analyst-plan';
import { importDataset, safeDatabaseFailure } from '../scripts/import-analyst-data';

const timestamp = '2026-01-01 00:00:00';
const edited = '2026-12-30 12:34:56';
const hash = 'a'.repeat(64);
const packName = 'Caja para Hamburguesa / S\u00e1ndwich';

function fixture(): Dataset {
  return {
    Zonas: [{
      id_zona: '1', nombre_barrio: 'Retiro', comuna: '1', codigo_postal: 'C1005',
      activo_zona: 'TRUE', distancia_promedio_km: '1,36',
    }],
    Empaques: [{
      id_empaque: '1', nombre_envase: packName, material_tradicional: 'Plastico',
      peso_base_g: '25', material_ecobite: 'Carton', peso_ecobite_g: '0',
      gramos_plastico_evitados: '25', uso_habitual: 'Comidas',
    }],
    Usuarios: ['CLIENTE', 'ADMIN_PLATAFORMA', 'RESTAURANTE_ADMIN', 'REPARTIDOR'].map((rol, i) => ({
      id_usuario: `USR-${i + 1}`, nombre_completo: 'Demo', email: `demo-${i}@example.test`,
      telefono: '', direccion_habitual: '', fecha_registro: timestamp, fecha_edicion: edited,
      activo_usuario: 'TRUE', password_hash: hash, rol, id_zona_habitual: '1',
    })),
    Restaurantes: [{
      id_restaurante: 'RES-1', nombre_restaurante: 'Local demo', categoria: '',
      es_100_eco: 'TRUE', activo_restaurante: 'TRUE', id_zona: '1', email: 'local@example.test',
      password_hash: hash, fecha_creacion: timestamp, fecha_edicion: edited,
    }],
    Producto: [{
      id_producto: 'PRD-1', id_restaurante: 'RES-1', nombre_producto: 'Comida',
      categoria_comida: 'Plato', precio: '10,25', disponible: 'TRUE',
      fecha_creacion: timestamp, fecha_edicion: edited,
    }],
    Producto_Empaque: [{ id_producto: 'PRD-1', id_empaque: '1', envases_por_unidad: '1' }],
    Pedidos: [{
      id_pedido: 'PED-1', id_usuario: 'USR-1', id_restaurante: 'RES-1',
      direccion_entrega: 'Direccion demo', monto_total: '20,50', distancia_estimada_km: '1,36',
      tipo_transporte: 'BICICLETA', total_envases_evitados: '2', co2_ahorrado_kg: '0,109',
      gramos_plastico_evitados_total: '50', pedido_estado: 'EN_PREPARACION',
      fecha_creacion: timestamp, fecha_edicion: edited, id_zona_destino: '1',
    }],
    Detalle: [{
      id_detalle: 'DET-1', id_pedido: 'PED-1', producto_nombre: 'Comida', cantidad: '2',
      precio_unitario: '10,25', gramos_plastico_evitados_item: '50', id_producto: 'PRD-1', envases_item: '2',
    }],
  };
}

test('S3 enums have three roles and four order states, without legacy/courier roles', () => {
  assert.deepEqual(Object.values(RolUsuario).sort(), ['ADMIN_PLATAFORMA', 'CLIENTE', 'RESTAURANTE_ADMIN']);
  assert.deepEqual(Object.values(EstadoPedido).sort(), ['CANCELADO', 'COMPLETADO', 'EN_PREPARACION', 'PENDIENTE']);
});

test('CSV parser handles BOM, CRLF, escaped quotes, commas, multiline fields and accents', () => {
  assert.deepEqual(parseCsv('\uFEFFnombre,nota\r\n"Caf\u00e9","a,b\r\n""c"""\r\n'), [
    { nombre: 'Caf\u00e9', nota: 'a,b\r\n"c"' },
  ]);
  for (const input of ['a,a\n1,2', 'a,b\n1', 'a,b\n1,2,3', 'a,b\n"x', 'a,b\nx"y,z', 'a,b\n"x"y,z']) {
    assert.throws(() => parseCsv(input), ImportValidationError);
  }
});

test('approved exclusion keeps all orders, does not mutate CSV rows and refuses courier references', () => {
  const original = fixture();
  const { data, excludedCouriers } = validateDataset(original);
  assert.equal(excludedCouriers, 1);
  assert.equal(data.Usuarios.length, 3);
  assert.equal(original.Usuarios.length, 4);
  assert.equal(data.Pedidos.length, original.Pedidos.length);
  original.Pedidos[0].id_usuario = 'USR-4';
  assert.throws(() => validateDataset(original), ImportValidationError);
});

test('validation rejects malformed fields without exposing their values', () => {
  const cases: [Sheet, string, string][] = [
    ['Usuarios', 'rol', 'ADMIN'], ['Usuarios', 'email', 'private-invalid-value'],
    ['Producto', 'disponible', 'yes'], ['Producto', 'precio', '1,001'],
    ['Producto', 'precio', 'NaN'], ['Producto', 'fecha_creacion', '2026-02-30 00:00:00'],
    ['Producto', 'fecha_edicion', 'not-a-date'], ['Detalle', 'cantidad', '2items'],
    ['Detalle', 'cantidad', '1.5'], ['Producto_Empaque', 'envases_por_unidad', '0'],
    ['Pedidos', 'pedido_estado', 'ENTREGADO'], ['Pedidos', 'monto_total', '123456789,00'],
    ['Usuarios', 'nombre_completo', 'Demo\u0000'], ['Usuarios', 'email', 'demo\u0000@example.test'],
  ];
  for (const [sheet, field, value] of cases) {
    const data = fixture();
    data[sheet][0][field] = value;
    assert.throws(() => validateDataset(data), (error: unknown) => {
      assert.ok(error instanceof ImportValidationError);
      assert.ok(error.issues.some((issue) => issue.includes(field)));
      assert.ok(!error.issues.join('\n').includes('private-invalid-value'));
      return true;
    });
  }
  const missing = fixture();
  delete missing.Usuarios[0].password_hash;
  assert.throws(() => validateDataset(missing), ImportValidationError);
});

test('all ten foreign keys and unique keys are validated before writes', () => {
  const references: [Sheet, string][] = [
    ['Usuarios', 'id_zona_habitual'], ['Restaurantes', 'id_zona'], ['Producto', 'id_restaurante'],
    ['Pedidos', 'id_usuario'], ['Pedidos', 'id_restaurante'], ['Pedidos', 'id_zona_destino'],
    ['Detalle', 'id_pedido'], ['Detalle', 'id_producto'],
    ['Producto_Empaque', 'id_producto'], ['Producto_Empaque', 'id_empaque'],
  ];
  for (const [sheet, field] of references) {
    const data = fixture();
    data[sheet][0][field] = data[sheet][0][field].replace(/\d+$/, '999');
    assert.throws(() => validateDataset(data), ImportValidationError);
  }
  for (const sheet of ['Usuarios', 'Detalle', 'Producto_Empaque'] as const) {
    const data = fixture();
    data[sheet].push({ ...data[sheet][0] });
    assert.throws(() => validateDataset(data), ImportValidationError);
  }
  const duplicate = fixture();
  duplicate.Usuarios[1].email = duplicate.Usuarios[0].email.toUpperCase();
  assert.throws(() => validateDataset(duplicate), ImportValidationError);
});

test('mapping preserves timestamps, hashes and decimals, with deterministic UUID/FK mapping', () => {
  const { data } = validateDataset(fixture());
  const plan = prepareImport(data, new Map([['Retiro', 'zone-uuid']]), new Map([[packName, 'pack-uuid']]));
  assert.equal(plan.usuarios[0].passwordHash, hash);
  for (const row of [plan.usuarios[0], plan.productos[0], plan.restaurantes[0], plan.pedidos[0]]) {
    assert.ok(row.fechaEdicion instanceof Date);
    assert.equal(row.fechaEdicion.toISOString(), '2026-12-30T12:34:56.000Z');
  }
  assert.equal(plan.productos[0].precio, '10.25');
  assert.equal(plan.pedidos[0].usuarioId, plan.usuarios[0].id);
  assert.equal(plan.detalles[0].pedidoId, plan.pedidos[0].id);
  assert.equal(plan.productoEmpaque[0].productoId, plan.productos[0].id);
  assert.equal(plan.usuarios[0].zonaHabitualId, 'zone-uuid');
  assert.equal(plan.productoEmpaque[0].empaqueId, 'pack-uuid');
  assert.equal(sourceId('usuario', 'USR-1'), sourceId('usuario', 'USR-1'));
  assert.notEqual(sourceId('usuario', 'USR-1'), sourceId('pedido', 'USR-1'));
  assert.match(plan.usuarios[0].id!, /^[a-f0-9-]{14}8[a-f0-9-]{21}$/);
  assert.throws(() => prepareImport(data, new Map(), new Map()), ImportValidationError);
});

test('KPI validation catches inconsistent amounts, packaging, CO2, transport and restaurant links', () => {
  const mutations: ((data: Dataset) => void)[] = [
    (data) => { data.Pedidos[0].monto_total = '999'; },
    (data) => { data.Pedidos[0].total_envases_evitados = '99'; },
    (data) => { data.Pedidos[0].gramos_plastico_evitados_total = '99'; },
    (data) => { data.Pedidos[0].co2_ahorrado_kg = '0,999'; },
    (data) => { data.Pedidos[0].distancia_estimada_km = '9'; },
    (data) => { data.Detalle[0].envases_item = '99'; },
    (data) => { data.Detalle[0].gramos_plastico_evitados_item = '99'; },
    (data) => { data.Empaques[0].peso_base_g = '99'; },
    (data) => {
      data.Zonas[0].distancia_promedio_km = '9';
      data.Pedidos[0].distancia_estimada_km = '9';
      data.Pedidos[0].co2_ahorrado_kg = '0,720';
    },
    (data) => {
      data.Restaurantes.push({ ...data.Restaurantes[0], id_restaurante: 'RES-2', email: 'other@example.test' });
      data.Producto[0].id_restaurante = 'RES-2';
    },
  ];
  for (const mutate of mutations) {
    const data = fixture();
    mutate(data);
    assert.throws(() => validateDataset(data), ImportValidationError);
  }
});

test('cancelled zero-total orders may have no details; current product price is not a historical snapshot', () => {
  const data = fixture();
  data.Producto[0].precio = '99';
  assert.doesNotThrow(() => validateDataset(data));
  data.Detalle = [];
  data.Pedidos[0].monto_total = '0';
  data.Pedidos[0].total_envases_evitados = '0';
  data.Pedidos[0].gramos_plastico_evitados_total = '0';
  assert.throws(() => validateDataset(data), ImportValidationError);
  data.Pedidos[0].pedido_estado = 'CANCELADO';
  assert.doesNotThrow(() => validateDataset(data));
});

test('CLI defaults to offline validation and rejects ambiguous file selection', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'ecobite-import-fixture-'));
  try {
    for (const [sheet, rows] of Object.entries(fixture())) {
      const columns = Object.keys(rows[0]);
      const csv = [columns.join(','), ...rows.map((row) => columns.map((column) =>
        `"${row[column].replaceAll('"', '""')}"`).join(','))].join('\r\n');
      writeFileSync(join(directory, `${sheet}.csv`), csv, 'utf8');
    }
    const run = promisify(execFile);
    const result = await run(process.execPath, ['--import', 'tsx', join(__dirname, '../scripts/import-analyst-data.ts')], {
      env: { ...process.env, ANALYST_DATA_DIR: directory, DATABASE_URL: '', DOTENV_CONFIG_PATH: 'not-a-real-env-file' },
    });
    assert.match(result.stdout, /PASS: validation only; no database connection or writes/);
    assert.match(result.stdout, /REPARTIDOR: 1 accounts excluded/);
    writeFileSync(join(directory, 'Usuarios.csv'), Buffer.from([0xff]));
    assert.throws(() => loadDataset(directory), (error: unknown) => {
      assert.ok(error instanceof ImportValidationError);
      assert.ok(error.issues[0].includes('Usuarios'));
      return true;
    });
    writeFileSync(join(directory, 'Dataset - Usuarios.csv'), 'irrelevant', 'utf8');
    assert.throws(() => loadDataset(directory), ImportValidationError);
  } finally {
    rmSync(directory, { recursive: true });
  }
});

test('CLI help and unknown flags do not load database credentials or print error details', async () => {
  const run = promisify(execFile);
  const script = join(__dirname, '../scripts/import-analyst-data.ts');
  const env = { ...process.env, DATABASE_URL: '', DOTENV_CONFIG_PATH: 'not-a-real-env-file' };
  const result = await run(process.execPath, ['--import', 'tsx', script, '--help'], { env });
  assert.match(result.stdout, /--dry-run/);
  await assert.rejects(run(process.execPath, ['--import', 'tsx', script, '--wrong'], { env }),
    (error: unknown) => error instanceof Error && 'stderr' in error && String(error.stderr).includes('Usage:'));
});

test('database failure diagnostics distinguish rollback causes without leaking driver details', () => {
  for (const code of ['P2002', 'P2034', 'P2028']) {
    const message = safeDatabaseFailure({ code, message: 'private-driver-input', meta: { value: 'private-email' } });
    assert.ok(message.includes(code));
    assert.ok(!message.includes('private'));
  }
  assert.ok(!safeDatabaseFailure(new Error('private-connection-string')).includes('private'));
});

test('PostgreSQL import is atomic, repeatable and preserves existing accounts', {
  skip: !process.env.IMPORT_TEST_DATABASE_URL,
}, async () => {
  const url = new URL(process.env.IMPORT_TEST_DATABASE_URL!);
  assert.ok(['localhost', '127.0.0.1'].includes(url.hostname));
  assert.match(url.pathname, /^\/ecobite_import_check_/);
  assert.equal(process.env.DATABASE_URL, url.href);
  const { prisma } = await import('../src/lib/prisma.js');
  try {
    const data = fixture();
    const before = await prisma.usuario.count();
    const zone = await prisma.zona.findUniqueOrThrow({ where: { nombreBarrio: 'Retiro' } });
    await prisma.restaurante.create({ data: {
      nombre: 'Email collision probe', email: data.Restaurantes[0].email,
      passwordHash: hash, zonaId: zone.id,
    } });
    await assert.rejects(importDataset(prisma, data), (error: unknown) =>
      !!error && typeof error === 'object' && 'code' in error && error.code === 'P2002');
    assert.equal(await prisma.usuario.count(), before, 'later unique failure must roll back earlier user inserts');

    data.Restaurantes[0].email = 'success@example.test';
    assert.deepEqual(await importDataset(prisma, data), {
      usuarios: 3, restaurantes: 1, productos: 1, pedidos: 1, detalles: 1, productoEmpaque: 1,
    });
    await prisma.usuario.update({
      where: { id: sourceId('usuario', 'USR-1') }, data: { nombreCompleto: 'Existing account edited after import' },
    });
    assert.deepEqual(await importDataset(prisma, data), {
      usuarios: 0, restaurantes: 0, productos: 0, pedidos: 0, detalles: 0, productoEmpaque: 0,
    });
    const user = await prisma.usuario.findUniqueOrThrow({ where: { id: sourceId('usuario', 'USR-1') } });
    assert.equal(user.nombreCompleto, 'Existing account edited after import');
    assert.equal(await prisma.usuario.findUnique({ where: { id: sourceId('usuario', 'USR-4') } }), null);
    const order = await prisma.pedido.findUniqueOrThrow({ where: { id: sourceId('pedido', 'PED-1') } });
    assert.equal(order.estado, 'EN_PREPARACION');
    assert.equal(order.fechaEdicion.toISOString(), '2026-12-30T12:34:56.000Z');
  } finally {
    await prisma.$disconnect();
  }
});
