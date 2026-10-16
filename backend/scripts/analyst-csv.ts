import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { EstadoPedido, RolUsuario, TipoTransporte } from '../src/generated/prisma/enums';

export const sheets = ['Zonas', 'Empaques', 'Usuarios', 'Restaurantes', 'Producto', 'Producto_Empaque', 'Pedidos', 'Detalle'] as const;
export type Sheet = typeof sheets[number];
export type Row = Record<string, string>;
export type Dataset = Record<Sheet, Row[]>;

export class ImportValidationError extends Error {
  constructor(readonly issues: string[]) {
    super('Import validation failed; nothing was written.');
  }
}

// Reject malformed CSV instead of silently shifting columns or losing fields.
export function parseCsv(text: string): Row[] {
  const records: string[][] = [];
  let row: string[] = [];
  let field = '';
  let state: 'start' | 'plain' | 'quoted' | 'closed' = 'start';
  const fail = () => { throw new ImportValidationError(['CSV: malformed quotes or row width']); };
  for (const char of text.replace(/^\uFEFF/, '') + '\n') {
    if (state === 'quoted') {
      if (char === '"') state = 'closed';
      else field += char;
    } else if (char === '"' && state === 'closed') {
      field += '"';
      state = 'quoted';
    } else if (char === '"' && state === 'start') {
      state = 'quoted';
    } else if (char === ',' || char === '\r' || char === '\n') {
      if (char === '\n' && state === 'start' && row.length === 0 && field === '') continue;
      row.push(field);
      field = '';
      state = 'start';
      if (char !== ',') {
        if (row.length !== 1 || row[0] !== '') records.push(row);
        row = [];
      }
    } else {
      if (state === 'closed' || char === '"') fail();
      field += char;
      state = 'plain';
    }
  }
  if (state === 'quoted') fail();
  const header = records.shift()?.map((value) => value.trim()) ?? [];
  if (!header.length || header.some((value) => !value) || new Set(header).size !== header.length) {
    throw new ImportValidationError(['CSV: missing or duplicate headers']);
  }
  return records.map((record) => {
    if (record.length !== header.length) fail();
    return Object.fromEntries(header.map((key, i) => [key, record[i]]));
  });
}

type Rule = (value: string) => boolean;
const text = (max = Infinity): Rule => (value) => value.trim().length > 0 && value.length <= max && !value.includes('\uFFFD');
const optional = (rule: Rule): Rule => (value) => value === '' || rule(value);
const integer = (min = 0, max = 2147483647): Rule => (value) =>
  /^\d+$/.test(value) && Number(value) >= min && Number(value) <= max;
const decimal = (precision: number, scale: number): Rule => (value) =>
  new RegExp(`^\\d{1,${precision - scale}}(?:[.,]\\d{1,${scale}})?$`).test(value);
const boolean: Rule = (value) => value === 'TRUE' || value === 'FALSE';
const oneOf = (values: string[]): Rule => (value) => values.includes(value);
const code = (prefix: string): Rule => (value) => new RegExp(`^${prefix}-\\d+$`).test(value);
const email: Rule = (value) => value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const hash: Rule = (value) => /^[a-f0-9]{64}$/i.test(value) || /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
const date: Rule = (value) => {
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) return false;
  const parsed = new Date(value.replace(' ', 'T') + 'Z');
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 19).replace('T', ' ') === value;
};

const fields: Record<Sheet, Record<string, Rule>> = {
  Zonas: {
    id_zona: integer(1), nombre_barrio: text(100), comuna: integer(1, 15),
    codigo_postal: text(10), activo_zona: boolean, distancia_promedio_km: decimal(5, 2),
  },
  Empaques: {
    id_empaque: integer(1), nombre_envase: text(100), material_tradicional: text(100),
    peso_base_g: decimal(8, 2), material_ecobite: text(100), peso_ecobite_g: decimal(8, 2),
    gramos_plastico_evitados: decimal(8, 2), uso_habitual: optional(text(100)),
  },
  Usuarios: {
    id_usuario: code('USR'), nombre_completo: text(), email, telefono: optional(text()),
    direccion_habitual: optional(text()), fecha_registro: date, fecha_edicion: date,
    activo_usuario: boolean, password_hash: hash,
    rol: oneOf([...Object.values(RolUsuario), 'REPARTIDOR']), id_zona_habitual: optional(integer(1)),
  },
  Restaurantes: {
    id_restaurante: code('RES'), nombre_restaurante: text(), categoria: optional(text()),
    es_100_eco: boolean, activo_restaurante: boolean, id_zona: integer(1),
    email, password_hash: hash, fecha_creacion: date, fecha_edicion: date,
  },
  Producto: {
    id_producto: code('PRD'), id_restaurante: code('RES'), nombre_producto: text(),
    categoria_comida: text(), precio: decimal(10, 2), disponible: boolean,
    fecha_creacion: date, fecha_edicion: date,
  },
  Producto_Empaque: {
    id_producto: code('PRD'), id_empaque: integer(1), envases_por_unidad: integer(1),
  },
  Pedidos: {
    id_pedido: code('PED'), id_usuario: code('USR'), id_restaurante: code('RES'),
    direccion_entrega: text(), monto_total: decimal(10, 2), distancia_estimada_km: decimal(5, 2),
    tipo_transporte: oneOf(Object.values(TipoTransporte)), total_envases_evitados: integer(),
    co2_ahorrado_kg: decimal(6, 3), gramos_plastico_evitados_total: decimal(8, 2),
    pedido_estado: oneOf(Object.values(EstadoPedido)), fecha_creacion: date,
    fecha_edicion: date, id_zona_destino: integer(1),
  },
  Detalle: {
    id_detalle: code('DET'), id_pedido: code('PED'), producto_nombre: text(),
    cantidad: integer(1), precio_unitario: decimal(10, 2), gramos_plastico_evitados_item: decimal(8, 2),
    id_producto: code('PRD'), envases_item: integer(),
  },
};

export function loadDataset(directory: string): Dataset {
  const files = readdirSync(directory);
  return Object.fromEntries(sheets.map((sheet) => {
    const matches = files.filter((file) => file === `${sheet}.csv` || file.endsWith(` - ${sheet}.csv`));
    if (matches.length !== 1) throw new ImportValidationError([`${sheet}: expected exactly one CSV`]);
    let rows: Row[];
    try {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(join(directory, matches[0])));
      rows = parseCsv(text);
    } catch (error) {
      const issues = error instanceof ImportValidationError ? error.issues : ['unreadable file or invalid UTF-8'];
      throw new ImportValidationError(issues.map((issue) => `${sheet}: ${issue}`));
    }
    if (!rows.length) throw new ImportValidationError([`${sheet}: empty CSV`]);
    return [sheet, rows];
  })) as Dataset;
}

export function normalizeName(value: string): string {
  return value.normalize('NFC').trim();
}

function duplicateIssues(rows: Row[], columns: string[], label: string, issues: string[]) {
  const seen = new Set<string>();
  for (const row of rows) {
    const key = JSON.stringify(columns.map((column) =>
      column === 'email' ? row[column].trim().toLowerCase() : normalizeName(row[column])));
    if (seen.has(key)) issues.push(`${label}: duplicate key`);
    seen.add(key);
  }
}

export function validateDataset(source: Dataset): { data: Dataset; excludedCouriers: number } {
  const issues: string[] = [];
  for (const sheet of sheets) {
    source[sheet].forEach((row, i) => {
      for (const [field, rule] of Object.entries(fields[sheet])) {
        if (typeof row[field] !== 'string' || row[field].includes('\u0000') || !rule(row[field])) {
          issues.push(`${sheet} row ${i + 2}: invalid ${field}`);
        }
      }
    });
  }
  // Stop before following references if basic fields are malformed.
  if (issues.length) throw new ImportValidationError(issues);
  const data = { ...source, Usuarios: source.Usuarios.filter((row) => row.rol !== 'REPARTIDOR') };
  const keys = {
    Zonas: 'id_zona', Empaques: 'id_empaque', Usuarios: 'id_usuario', Restaurantes: 'id_restaurante',
    Producto: 'id_producto', Pedidos: 'id_pedido', Detalle: 'id_detalle',
  } as const;
  for (const [sheet, key] of Object.entries(keys)) {
    duplicateIssues(source[sheet as keyof typeof keys], [key], sheet, issues);
  }
  duplicateIssues(source.Usuarios, ['email'], 'Usuarios.email', issues);
  duplicateIssues(source.Restaurantes, ['email'], 'Restaurantes.email', issues);
  duplicateIssues(data.Zonas, ['nombre_barrio'], 'Zonas.nombre_barrio', issues);
  duplicateIssues(data.Empaques, ['nombre_envase'], 'Empaques.nombre_envase', issues);
  duplicateIssues(data.Producto_Empaque, ['id_producto', 'id_empaque'], 'Producto_Empaque', issues);
  const relations: [Sheet, string, Sheet, string][] = [
    ['Usuarios', 'id_zona_habitual', 'Zonas', 'id_zona'],
    ['Restaurantes', 'id_zona', 'Zonas', 'id_zona'],
    ['Producto', 'id_restaurante', 'Restaurantes', 'id_restaurante'],
    ['Pedidos', 'id_usuario', 'Usuarios', 'id_usuario'],
    ['Pedidos', 'id_restaurante', 'Restaurantes', 'id_restaurante'],
    ['Pedidos', 'id_zona_destino', 'Zonas', 'id_zona'],
    ['Detalle', 'id_pedido', 'Pedidos', 'id_pedido'],
    ['Detalle', 'id_producto', 'Producto', 'id_producto'],
    ['Producto_Empaque', 'id_producto', 'Producto', 'id_producto'],
    ['Producto_Empaque', 'id_empaque', 'Empaques', 'id_empaque'],
  ];
  for (const [sheet, field, target, key] of relations) {
    const ids = new Set(data[target].map((row) => row[key]));
    data[sheet].forEach((row, i) => {
      if (!(sheet === 'Usuarios' && row[field] === '') && !ids.has(row[field])) {
        issues.push(`${sheet} row ${i + 2}: missing ${field} reference (possibly an excluded courier)`);
      }
    });
  }
  if (issues.length) throw new ImportValidationError(issues);
  validateCalculations(data, issues);
  if (issues.length) throw new ImportValidationError(issues);
  return { data, excludedCouriers: source.Usuarios.length - data.Usuarios.length };
}

// Fixed-point integers avoid floating-point drift in money and KPI checks.
function scaled(value: string, places = 2): bigint {
  const [whole, fraction = ''] = value.replace(',', '.').split('.');
  return BigInt(whole) * 10n ** BigInt(places) + BigInt(fraction.padEnd(places, '0'));
}

function validateCalculations(data: Dataset, issues: string[]) {
  const zones = new Map(data.Zonas.map((row) => [row.id_zona, row]));
  const packaging = new Map(data.Empaques.map((row) => [row.id_empaque, row]));
  const products = new Map(data.Producto.map((row) => [row.id_producto, row]));
  const orders = new Map(data.Pedidos.map((row) => [row.id_pedido, row]));
  const totals = new Map<string, { amount: bigint; grams: bigint; packages: bigint }>();
  const check = (ok: boolean, label: string) => { if (!ok) issues.push(label); };
  data.Empaques.forEach((row, i) => check(
    scaled(row.gramos_plastico_evitados) === scaled(row.peso_base_g) - scaled(row.peso_ecobite_g),
    `Empaques row ${i + 2}: grams do not match packaging weights`,
  ));
  data.Detalle.forEach((row, i) => {
    const links = data.Producto_Empaque.filter((link) => link.id_producto === row.id_producto);
    const quantity = BigInt(row.cantidad);
    const expectedPackages = quantity * links.reduce((sum, link) => sum + BigInt(link.envases_por_unidad), 0n);
    const expectedGrams = quantity * links.reduce((sum, link) =>
      sum + BigInt(link.envases_por_unidad) * scaled(packaging.get(link.id_empaque)!.gramos_plastico_evitados), 0n);
    check(products.get(row.id_producto)!.id_restaurante === orders.get(row.id_pedido)!.id_restaurante,
      `Detalle row ${i + 2}: product and order restaurants differ`);
    check(expectedPackages === BigInt(row.envases_item), `Detalle row ${i + 2}: package quantity mismatch`);
    check(expectedGrams === scaled(row.gramos_plastico_evitados_item), `Detalle row ${i + 2}: packaging grams mismatch`);
    const total = totals.get(row.id_pedido) ?? { amount: 0n, grams: 0n, packages: 0n };
    total.amount += quantity * scaled(row.precio_unitario);
    total.grams += scaled(row.gramos_plastico_evitados_item);
    total.packages += BigInt(row.envases_item);
    totals.set(row.id_pedido, total);
  });
  data.Pedidos.forEach((row, i) => {
    const total = totals.get(row.id_pedido);
    const distance = scaled(row.distancia_estimada_km);
    check(!!total || row.pedido_estado === 'CANCELADO', `Pedidos row ${i + 2}: non-cancelled order has no details`);
    check((total?.amount ?? 0n) === scaled(row.monto_total), `Pedidos row ${i + 2}: amount differs from detail sum`);
    check((total?.grams ?? 0n) === scaled(row.gramos_plastico_evitados_total), `Pedidos row ${i + 2}: plastic differs from detail sum`);
    check((total?.packages ?? 0n) === BigInt(row.total_envases_evitados), `Pedidos row ${i + 2}: packages differ from detail sum`);
    check(distance === scaled(zones.get(row.id_zona_destino)!.distancia_promedio_km), `Pedidos row ${i + 2}: distance differs from zone`);
    check(scaled(row.co2_ahorrado_kg, 3) === (distance * 8n + 5n) / 10n, `Pedidos row ${i + 2}: CO2 differs from rounded formula`);
    check(row.tipo_transporte !== 'BICICLETA' || distance <= 800n, `Pedidos row ${i + 2}: bicycle distance exceeds 8 km`);
  });
}
