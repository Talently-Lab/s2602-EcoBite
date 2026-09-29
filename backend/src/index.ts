import 'dotenv/config'
import express from 'express'
import apiRouter from './routes/index.route'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`API is running on: http://localhost:${PORT}/api`);
});