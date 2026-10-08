import { prisma } from '../src/lib/prisma'

// Fuente: Excel de Rebeca (Tablas_Ecobite_V3_AlternativaB), pestañas Zona/Distancias y Empaques.
// distanciaPromedioKm = Haversine desde el Obelisco (-34.6037, -58.3816), mínimo 0.5 km.
const zonas = [
  { nombreBarrio: 'Retiro', comuna: 1, codigoPostal: 'C1005', distanciaPromedioKm: 1.36 },
  { nombreBarrio: 'San Nicolás', comuna: 1, codigoPostal: 'C1008', distanciaPromedioKm: 0.5 },
  { nombreBarrio: 'Puerto Madero', comuna: 1, codigoPostal: 'C1107', distanciaPromedioKm: 1.86 },
  { nombreBarrio: 'San Telmo', comuna: 1, codigoPostal: 'C1065', distanciaPromedioKm: 2.09 },
  { nombreBarrio: 'Montserrat', comuna: 1, codigoPostal: 'C1070', distanciaPromedioKm: 1.05 },
  { nombreBarrio: 'Constitución', comuna: 1, codigoPostal: 'C1143', distanciaPromedioKm: 2.65 },
  { nombreBarrio: 'Recoleta', comuna: 2, codigoPostal: 'C1113', distanciaPromedioKm: 1.95 },
  { nombreBarrio: 'Balvanera', comuna: 3, codigoPostal: 'C1032', distanciaPromedioKm: 1.86 },
  { nombreBarrio: 'San Cristóbal', comuna: 3, codigoPostal: 'C1227', distanciaPromedioKm: 2.7 },
  { nombreBarrio: 'La Boca', comuna: 4, codigoPostal: 'C1155', distanciaPromedioKm: 3.91 },
  { nombreBarrio: 'Barracas', comuna: 4, codigoPostal: 'C1270', distanciaPromedioKm: 4.44 },
  { nombreBarrio: 'Parque Patricios', comuna: 4, codigoPostal: 'C1437', distanciaPromedioKm: 4.27 },
  { nombreBarrio: 'Nueva Pompeya', comuna: 4, codigoPostal: 'C1437', distanciaPromedioKm: 6.41 },
  { nombreBarrio: 'Almagro', comuna: 5, codigoPostal: 'C1183', distanciaPromedioKm: 3.64 },
  { nombreBarrio: 'Boedo', comuna: 5, codigoPostal: 'C1218', distanciaPromedioKm: 4.15 },
  { nombreBarrio: 'Caballito', comuna: 6, codigoPostal: 'C1405', distanciaPromedioKm: 5.76 },
  { nombreBarrio: 'Flores', comuna: 7, codigoPostal: 'C1406', distanciaPromedioKm: 8.0 },
  { nombreBarrio: 'Parque Chacabuco', comuna: 7, codigoPostal: 'C1406', distanciaPromedioKm: 6.66 },
  { nombreBarrio: 'Villa Soldati', comuna: 8, codigoPostal: 'C1439', distanciaPromedioKm: 9.14 },
  { nombreBarrio: 'Villa Riachuelo', comuna: 8, codigoPostal: 'C1439', distanciaPromedioKm: 11.74 },
  { nombreBarrio: 'Villa Lugano', comuna: 8, codigoPostal: 'C1439', distanciaPromedioKm: 11.42 },
  { nombreBarrio: 'Liniers', comuna: 9, codigoPostal: 'C1408', distanciaPromedioKm: 13.07 },
  { nombreBarrio: 'Mataderos', comuna: 9, codigoPostal: 'C1440', distanciaPromedioKm: 12.76 },
  { nombreBarrio: 'Parque Avellaneda', comuna: 9, codigoPostal: 'C1407', distanciaPromedioKm: 10.04 },
  { nombreBarrio: 'Villa Real', comuna: 10, codigoPostal: 'C1408', distanciaPromedioKm: 13.03 },
  { nombreBarrio: 'Monte Castro', comuna: 10, codigoPostal: 'C1407', distanciaPromedioKm: 11.29 },
  { nombreBarrio: 'Versalles', comuna: 10, codigoPostal: 'C1408', distanciaPromedioKm: 13.29 },
  { nombreBarrio: 'Floresta', comuna: 10, codigoPostal: 'C1407', distanciaPromedioKm: 9.61 },
  { nombreBarrio: 'Vélez Sarsfield', comuna: 10, codigoPostal: 'C1407', distanciaPromedioKm: 10.81 },
  { nombreBarrio: 'Villa Luro', comuna: 10, codigoPostal: 'C1408', distanciaPromedioKm: 11.7 },
  { nombreBarrio: 'Villa General Mitre', comuna: 11, codigoPostal: 'C1416', distanciaPromedioKm: 8.01 },
  { nombreBarrio: 'Villa Devoto', comuna: 11, codigoPostal: 'C1419', distanciaPromedioKm: 11.84 },
  { nombreBarrio: 'Villa del Parque', comuna: 11, codigoPostal: 'C1417', distanciaPromedioKm: 9.82 },
  { nombreBarrio: 'Villa Santa Rita', comuna: 11, codigoPostal: 'C1416', distanciaPromedioKm: 9.3 },
  { nombreBarrio: 'Coghlan', comuna: 12, codigoPostal: 'C1430', distanciaPromedioKm: 9.48 },
  { nombreBarrio: 'Saavedra', comuna: 12, codigoPostal: 'C1430', distanciaPromedioKm: 11.39 },
  { nombreBarrio: 'Villa Urquiza', comuna: 12, codigoPostal: 'C1431', distanciaPromedioKm: 10.23 },
  { nombreBarrio: 'Villa Pueyrredón', comuna: 12, codigoPostal: 'C1419', distanciaPromedioKm: 11.28 },
  { nombreBarrio: 'Nuñez', comuna: 13, codigoPostal: 'C1429', distanciaPromedioKm: 9.91 },
  { nombreBarrio: 'Belgrano', comuna: 13, codigoPostal: 'C1428', distanciaPromedioKm: 8.26 },
  { nombreBarrio: 'Colegiales', comuna: 13, codigoPostal: 'C1426', distanciaPromedioKm: 7.0 },
  { nombreBarrio: 'Palermo', comuna: 14, codigoPostal: 'C1425', distanciaPromedioKm: 4.78 },
  { nombreBarrio: 'Chacarita', comuna: 15, codigoPostal: 'C1427', distanciaPromedioKm: 6.88 },
  { nombreBarrio: 'Villa Crespo', comuna: 15, codigoPostal: 'C1414', distanciaPromedioKm: 5.73 },
  { nombreBarrio: 'La Paternal', comuna: 15, codigoPostal: 'C1416', distanciaPromedioKm: 8.03 },
  { nombreBarrio: 'Villa Ortúzar', comuna: 15, codigoPostal: 'C1427', distanciaPromedioKm: 8.35 },
  { nombreBarrio: 'Agronomía', comuna: 15, codigoPostal: 'C1417', distanciaPromedioKm: 9.46 },
  { nombreBarrio: 'Parque Chas', comuna: 15, codigoPostal: 'C1427', distanciaPromedioKm: 9.17 },
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

async function main() {
  await prisma.$transaction([
    ...zonas.map((zona) =>
      prisma.zona.upsert({ where: { nombreBarrio: zona.nombreBarrio }, update: zona, create: zona }),
    ),
    ...empaques.map((empaque) => {
      const data = { ...empaque, gramosPlasticoEvitados: empaque.pesoBaseG - empaque.pesoEcobiteG }
      return prisma.empaque.upsert({ where: { nombreEnvase: empaque.nombreEnvase }, update: data, create: data })
    }),
  ])

  console.log(`Seed completo: ${zonas.length} zonas y ${empaques.length} empaques.`)
}

main()
  .catch((error) => {
    console.error('Error en el seed:', error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
