import bcrypt from 'bcrypt'
import { prisma } from '../src/lib/prisma'
import { validateRegistration } from '../src/lib/validation'

// Fuente: Excel de Rebeca (Tablas_Ecobite_V3_AlternativaB), pestañas Zona/Distancias y Empaques.
// distanciaPromedioKm = Haversine desde el Obelisco (-34.6037, -58.3816), mínimo 0.5 km.
// latitud/longitud = centroide geométrico del barrio (GCBA, barrios.geojson, WGS84).
const zonas = [
  { nombreBarrio: 'Retiro', comuna: 1, codigoPostal: 'C1005', distanciaPromedioKm: 1.36, latitud: -34.588397, longitud: -58.375994 },
  { nombreBarrio: 'San Nicolás', comuna: 1, codigoPostal: 'C1008', distanciaPromedioKm: 0.5, latitud: -34.603666, longitud: -58.380515 },
  { nombreBarrio: 'Puerto Madero', comuna: 1, codigoPostal: 'C1107', distanciaPromedioKm: 1.86, latitud: -34.609210, longitud: -58.356354 },
  { nombreBarrio: 'San Telmo', comuna: 1, codigoPostal: 'C1065', distanciaPromedioKm: 2.09, latitud: -34.621521, longitud: -58.371541 },
  { nombreBarrio: 'Montserrat', comuna: 1, codigoPostal: 'C1070', distanciaPromedioKm: 1.05, latitud: -34.612686, longitud: -58.379648 },
  { nombreBarrio: 'Constitución', comuna: 1, codigoPostal: 'C1143', distanciaPromedioKm: 2.65, latitud: -34.625044, longitud: -58.384388 },
  { nombreBarrio: 'Recoleta', comuna: 2, codigoPostal: 'C1113', distanciaPromedioKm: 1.95, latitud: -34.585778, longitud: -58.394929 },
  { nombreBarrio: 'Balvanera', comuna: 3, codigoPostal: 'C1032', distanciaPromedioKm: 1.86, latitud: -34.609099, longitud: -58.403062 },
  { nombreBarrio: 'San Cristóbal', comuna: 3, codigoPostal: 'C1227', distanciaPromedioKm: 2.7, latitud: -34.623865, longitud: -58.401884 },
  { nombreBarrio: 'La Boca', comuna: 4, codigoPostal: 'C1155', distanciaPromedioKm: 3.91, latitud: -34.631070, longitud: -58.356819 },
  { nombreBarrio: 'Barracas', comuna: 4, codigoPostal: 'C1270', distanciaPromedioKm: 4.44, latitud: -34.646403, longitud: -58.384272 },
  { nombreBarrio: 'Parque Patricios', comuna: 4, codigoPostal: 'C1437', distanciaPromedioKm: 4.27, latitud: -34.637550, longitud: -58.401675 },
  { nombreBarrio: 'Nueva Pompeya', comuna: 4, codigoPostal: 'C1437', distanciaPromedioKm: 6.41, latitud: -34.650515, longitud: -58.418882 },
  { nombreBarrio: 'Almagro', comuna: 5, codigoPostal: 'C1183', distanciaPromedioKm: 3.64, latitud: -34.609227, longitud: -58.421745 },
  { nombreBarrio: 'Boedo', comuna: 5, codigoPostal: 'C1218', distanciaPromedioKm: 4.15, latitud: -34.629960, longitud: -58.418839 },
  { nombreBarrio: 'Caballito', comuna: 6, codigoPostal: 'C1405', distanciaPromedioKm: 5.76, latitud: -34.616825, longitud: -58.443603 },
  { nombreBarrio: 'Flores', comuna: 7, codigoPostal: 'C1406', distanciaPromedioKm: 8.0, latitud: -34.636803, longitud: -58.458268 },
  { nombreBarrio: 'Parque Chacabuco', comuna: 7, codigoPostal: 'C1406', distanciaPromedioKm: 6.66, latitud: -34.635940, longitud: -58.437696 },
  { nombreBarrio: 'Villa Soldati', comuna: 8, codigoPostal: 'C1439', distanciaPromedioKm: 9.14, latitud: -34.665421, longitud: -58.446587 },
  { nombreBarrio: 'Villa Riachuelo', comuna: 8, codigoPostal: 'C1439', distanciaPromedioKm: 11.74, latitud: -34.691858, longitud: -58.463350 },
  { nombreBarrio: 'Villa Lugano', comuna: 8, codigoPostal: 'C1439', distanciaPromedioKm: 11.42, latitud: -34.674993, longitud: -58.476167 },
  { nombreBarrio: 'Liniers', comuna: 9, codigoPostal: 'C1408', distanciaPromedioKm: 13.07, latitud: -34.643796, longitud: -58.519128 },
  { nombreBarrio: 'Mataderos', comuna: 9, codigoPostal: 'C1440', distanciaPromedioKm: 12.76, latitud: -34.658373, longitud: -58.501737 },
  { nombreBarrio: 'Parque Avellaneda', comuna: 9, codigoPostal: 'C1407', distanciaPromedioKm: 10.04, latitud: -34.648642, longitud: -58.476455 },
  { nombreBarrio: 'Villa Real', comuna: 10, codigoPostal: 'C1408', distanciaPromedioKm: 13.03, latitud: -34.619493, longitud: -58.526039 },
  { nombreBarrio: 'Monte Castro', comuna: 10, codigoPostal: 'C1407', distanciaPromedioKm: 11.29, latitud: -34.619298, longitud: -58.506581 },
  { nombreBarrio: 'Versalles', comuna: 10, codigoPostal: 'C1408', distanciaPromedioKm: 13.29, latitud: -34.630123, longitud: -58.522417 },
  { nombreBarrio: 'Floresta', comuna: 10, codigoPostal: 'C1407', distanciaPromedioKm: 9.61, latitud: -34.627686, longitud: -58.483588 },
  { nombreBarrio: 'Vélez Sarsfield', comuna: 10, codigoPostal: 'C1407', distanciaPromedioKm: 10.81, latitud: -34.631361, longitud: -58.493277 },
  { nombreBarrio: 'Villa Luro', comuna: 10, codigoPostal: 'C1408', distanciaPromedioKm: 11.7, latitud: -34.636413, longitud: -58.502729 },
  { nombreBarrio: 'Villa General Mitre', comuna: 11, codigoPostal: 'C1416', distanciaPromedioKm: 8.01, latitud: -34.610029, longitud: -58.468943 },
  { nombreBarrio: 'Villa Devoto', comuna: 11, codigoPostal: 'C1419', distanciaPromedioKm: 11.84, latitud: -34.602355, longitud: -58.514283 },
  { nombreBarrio: 'Villa del Parque', comuna: 11, codigoPostal: 'C1417', distanciaPromedioKm: 9.82, latitud: -34.604247, longitud: -58.490677 },
  { nombreBarrio: 'Villa Santa Rita', comuna: 11, codigoPostal: 'C1416', distanciaPromedioKm: 9.3, latitud: -34.616193, longitud: -58.482957 },
  { nombreBarrio: 'Coghlan', comuna: 12, codigoPostal: 'C1430', distanciaPromedioKm: 9.48, latitud: -34.560624, longitud: -58.474944 },
  { nombreBarrio: 'Saavedra', comuna: 12, codigoPostal: 'C1430', distanciaPromedioKm: 11.39, latitud: -34.553076, longitud: -58.488745 },
  { nombreBarrio: 'Villa Urquiza', comuna: 12, codigoPostal: 'C1431', distanciaPromedioKm: 10.23, latitud: -34.571541, longitud: -58.487856 },
  { nombreBarrio: 'Villa Pueyrredón', comuna: 12, codigoPostal: 'C1419', distanciaPromedioKm: 11.28, latitud: -34.582103, longitud: -58.503499 },
  { nombreBarrio: 'Nuñez', comuna: 13, codigoPostal: 'C1429', distanciaPromedioKm: 9.91, latitud: -34.543481, longitud: -58.462751 },
  { nombreBarrio: 'Belgrano', comuna: 13, codigoPostal: 'C1428', distanciaPromedioKm: 8.26, latitud: -34.554763, longitud: -58.450241 },
  { nombreBarrio: 'Colegiales', comuna: 13, codigoPostal: 'C1426', distanciaPromedioKm: 7.0, latitud: -34.574642, longitud: -58.450968 },
  { nombreBarrio: 'Palermo', comuna: 14, codigoPostal: 'C1425', distanciaPromedioKm: 4.78, latitud: -34.573855, longitud: -58.422342 },
  { nombreBarrio: 'Chacarita', comuna: 15, codigoPostal: 'C1427', distanciaPromedioKm: 6.88, latitud: -34.588369, longitud: -58.454180 },
  { nombreBarrio: 'Villa Crespo', comuna: 15, codigoPostal: 'C1414', distanciaPromedioKm: 5.73, latitud: -34.598830, longitud: -58.442725 },
  { nombreBarrio: 'La Paternal', comuna: 15, codigoPostal: 'C1416', distanciaPromedioKm: 8.03, latitud: -34.597421, longitud: -58.468665 },
  { nombreBarrio: 'Villa Ortúzar', comuna: 15, codigoPostal: 'C1427', distanciaPromedioKm: 8.35, latitud: -34.580973, longitud: -58.467651 },
  { nombreBarrio: 'Agronomía', comuna: 15, codigoPostal: 'C1417', distanciaPromedioKm: 9.46, latitud: -34.592945, longitud: -58.488673 },
  { nombreBarrio: 'Parque Chas', comuna: 15, codigoPostal: 'C1427', distanciaPromedioKm: 9.17, latitud: -34.585523, longitud: -58.479121 },
]

const empaques = [
  { nombreEnvase: 'Caja para Hamburguesa / Sándwich', materialTradicional: 'Poliestireno expandido (Telgopor)', pesoBaseG: 25, materialEcobite: 'Fibra de Caña de Azúcar / Cartón Kraft', pesoEcobiteG: 0, usoHabitual: 'Hamburguesas; lomitos; choripán; sándwiches de milanesa' },
  { nombreEnvase: 'Contenedor / Vianda Rectangular', materialTradicional: 'Plástico Polipropileno (PP) / Telgopor', pesoBaseG: 35, materialEcobite: 'Bagazo de Caña / Fécula de Maíz', pesoEcobiteG: 0, usoHabitual: 'Milanesa con papas; pastel de papas; ñoquis, ravioles y tallarines' },
  { nombreEnvase: 'Bowl Circular (750ml / 1000ml)', materialTradicional: 'Plástico PET rígido transparente', pesoBaseG: 40, materialEcobite: 'Cartón Kraft laminado en PLA / Caña', pesoEcobiteG: 0, usoHabitual: 'Ensaladas; guisos y locro; fideos con salsa' },
  { nombreEnvase: 'Pote para Salsa / Dip (60-120 ml)', materialTradicional: 'Poliestireno (PS) inyectado', pesoBaseG: 8, materialEcobite: 'Papel compostable / Bioplástico PLA', pesoEcobiteG: 0, usoHabitual: 'Aderezos; salsas. (Chimichurri; salsa criolla; mayonesa; mostaza)' },
  { nombreEnvase: 'Envase para Postre / Helado', materialTradicional: 'Pote de Telgopor / Plástico Copolímero', pesoBaseG: 20, materialEcobite: 'Cartón polipapel / Bioplástico PLA', pesoEcobiteG: 0, usoHabitual: 'Helado artesanal; postres' },
  { nombreEnvase: 'Caja para Pizza / Empanadas', materialTradicional: 'Cartón con faja / lámina plástica', pesoBaseG: 15, materialEcobite: 'Cartón corrugado 100% reciclado', pesoEcobiteG: 0, usoHabitual: 'Pizzas; empanadas' },
  { nombreEnvase: 'Kit Cubiertos + Bolsa', materialTradicional: 'Plástico de un solo uso (Camiseta)', pesoBaseG: 12, materialEcobite: 'Madera de bambú + Bolsa Kraft', pesoEcobiteG: 0, usoHabitual: 'Complementos del pedido' },
  { nombreEnvase: 'Vaso / Botella para bebida', materialTradicional: 'Plástico PET / Poliestireno (Desechable)', pesoBaseG: 22, materialEcobite: 'Cartón polipapel / Bioplástico PLA compostable', pesoEcobiteG: 0, usoHabitual: 'Licuados; jugos; gaseosas de la casa' },
]

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (!email && !password) {
    console.log('Seed de admin omitido: SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD no están configuradas.')
    return
  }
  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD deben configurarse juntas.')
  }
  const admin = validateRegistration({
    name: process.env.SEED_ADMIN_NAME || 'Administrador EcoBite',
    email,
    password,
  })
  const passwordHash = await bcrypt.hash(admin.password, 12)
  await prisma.usuario.upsert({
    where: { email: admin.email },
    update: { passwordHash, rol: 'ADMIN_PLATAFORMA', activo: true },
    create: { nombreCompleto: admin.name, email: admin.email, passwordHash, rol: 'ADMIN_PLATAFORMA' },
  })
  console.log(`Seed de admin aplicado para ${admin.email} (rol ADMIN_PLATAFORMA).`)
}

// Cuentas demo para la verificación del PM (workbook decisión 11): un cliente y
// un restaurante ya aprobado con su usuario RESTAURANTE_ADMIN vinculado. El
// restaurante se siembra inactivo para que nunca aparezca en el catálogo
// público. Los emails son fijos y documentados; la contraseña solo vive en el
// entorno.
const DEMO_CLIENTE_EMAIL = 'cliente.demo@ecobite.test'
const DEMO_RESTAURANTE_EMAIL = 'restaurante.demo@ecobite.test'

async function seedDemoUsers() {
  const password = process.env.SEED_DEMO_USERS_PASSWORD
  if (!password) {
    console.log('Seed de usuarios demo omitido: SEED_DEMO_USERS_PASSWORD no está configurada.')
    return
  }

  const cliente = validateRegistration({ name: 'Cliente Demo', email: DEMO_CLIENTE_EMAIL, password })
  const clienteHash = await bcrypt.hash(cliente.password, 12)
  await prisma.usuario.upsert({
    where: { email: cliente.email },
    update: { passwordHash: clienteHash, rol: 'CLIENTE', activo: true },
    create: { nombreCompleto: cliente.name, email: cliente.email, passwordHash: clienteHash, rol: 'CLIENTE' },
  })

  const zona = await prisma.zona.findUnique({ where: { nombreBarrio: 'Palermo' } })
  if (!zona) throw new Error('Zona Palermo no encontrada; el seed base de zonas debe correr antes.')

  const restaurante = await prisma.restaurante.upsert({
    where: { email: DEMO_RESTAURANTE_EMAIL },
    update: { activo: false },
    create: {
      nombre: 'Restaurante Demo EcoBite',
      direccion: 'Av. Santa Fe 3000',
      categoria: 'COMIDA_SALUDABLE',
      email: DEMO_RESTAURANTE_EMAIL,
      zonaId: zona.id,
      activo: false,
    },
  })

  const restUser = validateRegistration({ name: 'Restaurante Demo', email: DEMO_RESTAURANTE_EMAIL, password })
  const restHash = await bcrypt.hash(restUser.password, 12)
  const restUsuario = await prisma.usuario.upsert({
    where: { email: restUser.email },
    update: { passwordHash: restHash, rol: 'RESTAURANTE_ADMIN', activo: true, restauranteId: restaurante.id },
    create: {
      nombreCompleto: restUser.name,
      email: restUser.email,
      passwordHash: restHash,
      rol: 'RESTAURANTE_ADMIN',
      restauranteId: restaurante.id,
    },
  })

  const adminRevisor = process.env.SEED_ADMIN_EMAIL
    ? await prisma.usuario.findUnique({ where: { email: process.env.SEED_ADMIN_EMAIL.trim().toLowerCase() }, select: { id: true } })
    : null

  await prisma.solicitudRestaurante.upsert({
    where: { email: DEMO_RESTAURANTE_EMAIL },
    update: { estado: 'APROBADA', fechaRevision: new Date(), adminRevisorId: adminRevisor?.id ?? null },
    create: {
      usuarioId: restUsuario.id,
      nombreRestaurante: restaurante.nombre,
      direccion: restaurante.direccion,
      email: DEMO_RESTAURANTE_EMAIL,
      categoria: 'COMIDA_SALUDABLE',
      estado: 'APROBADA',
      fechaAceptacionCompromiso: new Date(),
      fechaRevision: new Date(),
      adminRevisorId: adminRevisor?.id ?? null,
      zonaId: zona.id,
    },
  })
  console.log('Seed de usuarios demo aplicado (cliente + restaurante aprobado).')
}

async function main() {
  await prisma.$transaction(
    [
      ...zonas.map((zona) =>
        prisma.zona.upsert({ where: { nombreBarrio: zona.nombreBarrio }, update: zona, create: zona }),
      ),
      ...empaques.map((empaque) => {
        const data = { ...empaque, gramosPlasticoEvitados: empaque.pesoBaseG - empaque.pesoEcobiteG }
        return prisma.empaque.upsert({ where: { nombreEnvase: empaque.nombreEnvase }, update: data, create: data })
      }),
    ],
    { timeout: 60000 },
  )

  await seedAdmin()
  await seedDemoUsers()

  console.log(`Seed completo: ${zonas.length} zonas y ${empaques.length} empaques.`)
}

main()
  .catch((error) => {
    console.error('Error en el seed:', error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
