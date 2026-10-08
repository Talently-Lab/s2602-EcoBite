import 'dotenv/config'
import express from 'express'
import { prisma } from './lib/prisma'
import apiRouter from './routes/index.route'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use('/api', apiRouter);

async function start() {
  await prisma.$queryRaw`SELECT 1`
  app.listen(PORT, () => {
    console.log(`API is running on: http://localhost:${PORT}/api`);
  });
}

start().catch(async (error) => {
  console.error('No se pudo conectar a la base de datos:', error)
  await prisma.$disconnect()
  process.exit(1)
})