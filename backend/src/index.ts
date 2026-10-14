import 'dotenv/config'
import { createApp } from './app'
import { ConfigError, readConfig } from './lib/config'
import { prisma } from './lib/prisma'

const PORT = process.env.PORT || 3000

async function start() {
  const app = createApp(prisma, readConfig(process.env))
  await prisma.$queryRaw`SELECT 1`
  app.listen(PORT, () => {
    console.log(`API is running on: http://localhost:${PORT}/api`);
  });
}

start().catch(async (error) => {
  const detail = error instanceof ConfigError ? error.message : error instanceof Error ? error.name : 'UnknownError'
  console.error('No se pudo iniciar la API:', detail)
  await prisma.$disconnect()
  process.exit(1)
})
