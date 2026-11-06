import 'dotenv/config'
import { createApp } from './app'
import { ConfigError, readConfig } from './lib/config'
import { prisma } from './lib/prisma'

const PORT = process.env.PORT || 3000
const SHUTDOWN_TIMEOUT_MS = 10_000

async function start() {
  const app = createApp(prisma, readConfig(process.env))
  await prisma.$queryRaw`SELECT 1`
  const server = app.listen(PORT, () => {
    console.log(`API is running on: http://localhost:${PORT}/api`);
  });

  let shuttingDown = false
  const shutdown = (signal: 'SIGTERM' | 'SIGINT') => {
    if (shuttingDown) return
    shuttingDown = true
    console.log(`Señal ${signal} recibida, cerrando servidor...`)
    setTimeout(() => {
      console.error(`El apagado superó ${SHUTDOWN_TIMEOUT_MS / 1000} s; forzando la salida.`)
      server.closeAllConnections()
      process.exit(1)
    }, SHUTDOWN_TIMEOUT_MS).unref()
    server.close(async (error) => {
      await prisma.$disconnect()
      if (error) {
        console.error('No se pudo cerrar el servidor:', error.message)
        process.exit(1)
      }
      console.log('Servidor cerrado correctamente.')
      process.exit(0)
    })
    server.closeIdleConnections()
  }
  process.once('SIGTERM', () => shutdown('SIGTERM'))
  process.once('SIGINT', () => shutdown('SIGINT'))
}

start().catch(async (error) => {
  const detail = error instanceof ConfigError ? error.message : error instanceof Error ? error.name : 'UnknownError'
  console.error('No se pudo iniciar la API:', detail)
  await prisma.$disconnect()
  process.exit(1)
})
