import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import routes from './routes/api.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  // API is same-origin behind Vite or your production reverse proxy; no wildcard CORS.
  app.use(helmet());
  app.use('/api', (_req,res,next)=>{res.set('Cache-Control','no-store');next();});
  app.use(express.json({ limit: '2mb' }));
  app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: 180, standardHeaders: 'draft-7', legacyHeaders: false }));
  app.get('/api/health', (_req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ status: mongoose.connection.readyState === 1 ? 'ok' : 'database-unavailable', service: 'inclusive-campus-api' }));
  app.use('/api', routes);
  app.use((_req, res) => res.status(404).json({ error: 'Endpoint not found.' }));
  app.use((err, _req, res, _next) => {
    if (err instanceof ZodError) return res.status(400).json({ error: 'Invalid input.', fields: err.issues.map(e => ({ path: e.path.join('.'), message: e.message })) });
    if (err.name === 'VersionError') return res.status(409).json({error:'This record changed while you were editing it. Reload and try again.'});
    if (err.code === 11000) return res.status(409).json({ error: 'A record with these details already exists.' });
    if (err.name === 'ValidationError' || err.name === 'CastError') return res.status(400).json({ error: 'Invalid record data.' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Payload exceeds 2 MB.' });
    if (err instanceof SyntaxError && err.status === 400) return res.status(400).json({ error: 'Invalid JSON.' });
    // Never log request bodies, credentials, notes, document bytes or stack traces.
    if (!err.status) console.error('API error:', err.name || 'Error');
    res.status(err.status || 500).json({ error: err.status ? err.message : 'An unexpected server error occurred.' });
  });
  return app;
}
