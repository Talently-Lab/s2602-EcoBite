import { createHash } from 'node:crypto';
import type { EstadoPedido, RolUsuario, TipoTransporte } from '../src/generated/prisma/enums';
import type { Prisma } from '../src/generated/prisma/client';
import { ImportValidationError, normalizeName, type Dataset } from './analyst-csv';

// Application-specific version-8 UUIDs: stable per entity/source code.
export function sourceId(entity: string, code: string): string {
  const bytes = createHash('sha256').update(`${entity}:${code}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x80;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export type ImportPlan = {
  usuarios: Prisma.UsuarioCreateManyInput[];
  restaurantes: Prisma.RestauranteCreateManyInput[];
  productos: Prisma.ProductoCreateManyInput[];
  pedidos: Prisma.PedidoCreateManyInput[];
  detalles: Prisma.DetalleCreateManyInput[];
  productoEmpaque: Prisma.ProductoEmpaqueCreateManyInput[];
};

const decimal = (value: string) => value.replace(',', '.');
const date = (value: string) => new Date(value.replace(' ', 'T') + 'Z');
const optional = (value: string) => value === '' ? null : value;

export function prepareImport(data: Dataset, zones: Map<string, string>, packaging: Map<string, string>): ImportPlan {
  const referenceIds = (rows: Dataset['Zonas'], id: string, name: string, existing: Map<string, string>) => {
    const result = new Map<string, string>();
    for (const row of rows) {
      const mapped = existing.get(normalizeName(row[name]));
      if (!mapped) throw new ImportValidationError([`${name}: missing seeded reference; run the reference seed first`]);
      result.set(row[id], mapped);
    }
    return result;
  };
  const zoneId = referenceIds(data.Zonas, 'id_zona', 'nombre_barrio', zones);
  const packagingId = referenceIds(data.Empaques, 'id_empaque', 'nombre_envase', packaging);
  const lookup = (map: Map<string, string>, code: string): string => {
    const id = map.get(code);
    if (!id) throw new ImportValidationError(['Missing reference mapping; nothing was written']);
    return id;
  };
  return {
    usuarios: data.Usuarios.map((row) => ({
      id: sourceId('usuario', row.id_usuario),
      nombreCompleto: row.nombre_completo,
      email: row.email.trim().toLowerCase(),
      telefono: optional(row.telefono),
      direccionHabitual: optional(row.direccion_habitual),
      fechaRegistro: date(row.fecha_registro),
      fechaEdicion: date(row.fecha_edicion),
      activo: row.activo_usuario === 'TRUE',
      passwordHash: row.password_hash,
      rol: row.rol as RolUsuario,
      zonaHabitualId: row.id_zona_habitual ? lookup(zoneId, row.id_zona_habitual) : null,
    })),
    restaurantes: data.Restaurantes.map((row) => ({
      id: sourceId('restaurante', row.id_restaurante),
      nombre: row.nombre_restaurante,
      categoria: optional(row.categoria),
      esEco: row.es_100_eco === 'TRUE',
      activo: row.activo_restaurante === 'TRUE',
      zonaId: lookup(zoneId, row.id_zona),
      email: row.email.trim().toLowerCase(),
      passwordHash: row.password_hash,
      fechaCreacion: date(row.fecha_creacion),
      fechaEdicion: date(row.fecha_edicion),
    })),
    productos: data.Producto.map((row) => ({
      id: sourceId('producto', row.id_producto),
      restauranteId: sourceId('restaurante', row.id_restaurante),
      nombre: row.nombre_producto,
      categoriaComida: row.categoria_comida,
      precio: decimal(row.precio),
      disponible: row.disponible === 'TRUE',
      fechaCreacion: date(row.fecha_creacion),
      fechaEdicion: date(row.fecha_edicion),
    })),
    pedidos: data.Pedidos.map((row) => ({
      id: sourceId('pedido', row.id_pedido),
      usuarioId: sourceId('usuario', row.id_usuario),
      restauranteId: sourceId('restaurante', row.id_restaurante),
      direccionEntrega: row.direccion_entrega,
      montoTotal: decimal(row.monto_total),
      distanciaEstimadaKm: decimal(row.distancia_estimada_km),
      tipoTransporte: row.tipo_transporte as TipoTransporte,
      totalEnvasesEvitados: Number(row.total_envases_evitados),
      co2AhorradoKg: decimal(row.co2_ahorrado_kg),
      gramosPlasticoEvitadosTotal: decimal(row.gramos_plastico_evitados_total),
      estado: row.pedido_estado as EstadoPedido,
      fechaCreacion: date(row.fecha_creacion),
      fechaEdicion: date(row.fecha_edicion),
      zonaDestinoId: lookup(zoneId, row.id_zona_destino),
    })),
    detalles: data.Detalle.map((row) => ({
      id: sourceId('detalle', row.id_detalle),
      pedidoId: sourceId('pedido', row.id_pedido),
      productoId: sourceId('producto', row.id_producto),
      productoNombre: row.producto_nombre,
      cantidad: Number(row.cantidad),
      precioUnitario: decimal(row.precio_unitario),
      gramosPlasticoEvitadosItem: decimal(row.gramos_plastico_evitados_item),
      envasesItem: Number(row.envases_item),
    })),
    productoEmpaque: data.Producto_Empaque.map((row) => ({
      productoId: sourceId('producto', row.id_producto),
      empaqueId: lookup(packagingId, row.id_empaque),
      envasesPorUnidad: Number(row.envases_por_unidad),
    })),
  };
}
