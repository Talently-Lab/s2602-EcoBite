# Diagrama Entidad-Relación (DER) - EcoBite — S2

El esquema vivo vive en `backend/prisma/schema.prisma` (PostgreSQL + Prisma). Este documento es la referencia visual; mantener ambos en sync al cambiar el modelo.

Fuente de datos: Excel del Data Analyst `Tablas_Ecobite_V3_AlternativaB` (Alternativa B = tabla puente `Producto_Empaque`). Modalidad del equipo: **Delivery sustentable** (Zona + Producto + empaques eco), por eso no existe el modelo `Surplus`.

```mermaid
erDiagram
    USUARIO }o--o| ZONA : "habita en"
    USUARIO ||--o{ PEDIDO : realiza
    ZONA ||--o{ RESTAURANTES : contiene
    ZONA ||--o{ PEDIDO : "destino de"
    RESTAURANTES ||--|{ PRODUCTO : publica
    RESTAURANTES ||--o{ PEDIDO : recibe
    PEDIDO ||--|{ DETALLE : contiene
    PRODUCTO ||--o{ DETALLE : incluye
    PRODUCTO ||--o{ PRODUCTO_EMPAQUE : usa
    EMPAQUE ||--o{ PRODUCTO_EMPAQUE : "se usa en"

    USUARIO {
        uuid id_usuario PK
        string nombre_completo
        string email UK
        string telefono
        string direccion_habitual
        timestamp fecha_registro
        timestamp fecha_edicion
        boolean activo_usuario
        string password_hash
        enum rol "CLIENTE | ADMIN"
        uuid id_zona_habitual FK
    }

    ZONA {
        uuid id_zona PK
        varchar nombre_barrio UK "100"
        int comuna
        varchar codigo_postal "10"
        boolean activo_zona
        decimal distancia_promedio_km "(5,2)"
    }

    RESTAURANTES {
        uuid id_restaurante PK
        string nombre_restaurante
        string categoria
        boolean es_100_eco
        boolean activo_restaurante
        uuid id_zona FK
        string email UK
        string password_hash
        timestamp fecha_creacion
        timestamp fecha_edicion
    }

    PRODUCTO {
        uuid id_producto PK
        uuid id_restaurante FK
        string nombre_producto
        string categoria_comida
        decimal precio "(10,2)"
        boolean disponible
        timestamp fecha_creacion
        timestamp fecha_edicion
    }

    PEDIDO {
        uuid id_pedido PK
        uuid id_usuario FK
        uuid id_restaurante FK
        string direccion_entrega
        decimal monto_total "(10,2)"
        decimal distancia_estimada_km "(5,2) — copia de zona destino"
        enum tipo_transporte "BICICLETA | VEHICULO_ELECTRICO"
        int total_envases_evitados "calculado"
        decimal co2_ahorrado_kg "(6,3) — calculado"
        decimal gramos_plastico_evitados_total "(8,2) — calculado"
        enum pedido_estado "PENDIENTE | COMPLETADO | CANCELADO"
        timestamp fecha_creacion
        timestamp fecha_edicion
        uuid id_zona_destino FK
    }

    DETALLE {
        uuid id_detalle PK
        uuid id_pedido FK
        string producto_nombre "snapshot del nombre al comprar"
        int cantidad
        decimal precio_unitario "(10,2)"
        decimal gramos_plastico_evitados_item "(8,2)"
        int envases_item "calculado"
        uuid id_producto FK
    }

    EMPAQUE {
        uuid id_empaque PK
        varchar nombre_envase UK "100"
        varchar material_tradicional "100"
        decimal peso_base_g "(8,2)"
        varchar material_ecobite "100"
        decimal peso_ecobite_g "(8,2)"
        decimal gramos_plastico_evitados "(8,2)"
        varchar uso_habitual "100"
    }

    PRODUCTO_EMPAQUE {
        uuid id_producto "PK, FK"
        uuid id_empaque "PK, FK"
        int envases_por_unidad "mínimo 1 (CHECK)"
    }
```

## Notas

- **Datos de referencia (seed)**: `pnpm --filter backend prisma:seed` carga los 48 barrios de CABA en `zona` y los 8 envases en `empaques` (idempotente). `distancia_promedio_km` = Haversine desde el Obelisco (-34.6037, -58.3816), mínimo 0.5 km. Restaurantes, productos y `producto_empaque` los provee el Data Analyst más adelante.
- **Autenticación**: los restaurantes inician sesión con su propia tabla (`email` + `password_hash`), por eso `rol` de usuario no incluye `COMERCIO`.
- **Enums**: `rol` (CLIENTE | ADMIN), `tipo_transporte` (BICICLETA | VEHICULO_ELECTRICO), `pedido_estado` (PENDIENTE | COMPLETADO | CANCELADO). Los KPIs filtran por `COMPLETADO`.
- **Texto libre (no enum)**: `restaurantes.categoria` y `producto.categoria_comida`.
- **`detalle.producto_nombre` y `precio_unitario`** son copias históricas: si el restaurante cambia el producto, el pedido sigue mostrando lo que se compró.

### Campos calculados (se guardan al crear el pedido)

Constante: `CO2_KG_POR_KM = 0.08`.

| Campo | Fórmula |
|---|---|
| `empaques.gramos_plastico_evitados` | `peso_base_g - peso_ecobite_g` |
| `detalle.envases_item` | `cantidad × SUM(envases_por_unidad)` del producto |
| `detalle.gramos_plastico_evitados_item` | `cantidad × SUM(envases_por_unidad × gramos_plastico_evitados)` |
| `pedidos.distancia_estimada_km` | copia de `zona.distancia_promedio_km` de la zona destino |
| `pedidos.co2_ahorrado_kg` | `distancia_estimada_km × 0.08` |
| `pedidos.total_envases_evitados` | `SUM(detalle.envases_item)` |
| `pedidos.gramos_plastico_evitados_total` | `SUM(detalle.gramos_plastico_evitados_item)` |
| `pedidos.monto_total` | `SUM(cantidad × precio_unitario)` (sin costo de envío por ahora) |

Ejemplo de control: Palermo (4.78 km) → `co2_ahorrado_kg = 0.382`.
