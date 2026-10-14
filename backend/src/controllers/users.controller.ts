import type { RequestHandler } from 'express';
import { validateCredentials, validateRegistration } from '../lib/validation';
import type { createUserService } from '../services/users.service';

export function createUserController(service: ReturnType<typeof createUserService>) {
  const register: RequestHandler = async (req, res) => {
    const user = await service.register(validateRegistration(req.body));
    res.status(201).json({ user });
  };
  const login: RequestHandler = async (req, res) => {
    res.json(await service.login(validateCredentials(req.body)));
  };
  const me: RequestHandler = async (_req, res) => {
    res.json({ user: await service.currentUser(res.locals.userId) });
  };
  return { register, login, me };
}
