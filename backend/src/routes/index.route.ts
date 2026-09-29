import { Router } from 'express';

const apiRouter = Router();

apiRouter.use('/', (_req, res) => {
  res.json({ message: 'API is working!' });
  console.log('Api is working!');
});

export default apiRouter;