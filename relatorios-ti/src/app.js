import path from 'node:path';
import express from 'express';
import cookieSession from 'cookie-session';

import { requireAuth } from './middleware/auth.js';
import { ensureSchema } from './services/ensureSchema.js';
import { ensureAdminUser } from './services/ensureAdmin.js';
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import reportRoutes from './routes/reports.js';
import dashboardRoutes from './routes/dashboard.js';

export async function createApp() {
  await ensureSchema();
  await ensureAdminUser();

  const app = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  // Em produção o Netlify serve os arquivos de public/ direto pelo CDN
  // (não passam pela function); isto aqui só é usado no `npm run dev` local.
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Sessão sem estado no servidor (dados assinados no próprio cookie),
  // necessário porque funções serverless não compartilham memória entre
  // invocações.
  app.use(cookieSession({
    name: 'techwave_session',
    secret: process.env.SESSION_SECRET || 'dev-secret-troque-em-producao',
    maxAge: 1000 * 60 * 60 * 8, // 8 horas
    httpOnly: true,
    sameSite: 'lax',
  }));

  app.use(authRoutes);
  app.use(requireAuth);

  app.use('/clients', clientRoutes);
  app.use('/reports', reportRoutes);
  app.use('/', dashboardRoutes);

  app.use((req, res) => {
    res.status(404).send('Página não encontrada');
  });

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(`Erro interno: ${err.message}`);
  });

  return app;
}
