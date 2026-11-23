import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { validateEnvironment } from './security.js';
try {
  validateEnvironment();
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const server = createApp().listen(Number(process.env.PORT) || 5000, '0.0.0.0', () => console.log(`Inclusive Campus API listening on port ${process.env.PORT || 5000}`));
  for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => { server.close(async () => { await mongoose.disconnect(); process.exit(0); }); });
} catch (error) {
  console.error('API startup failed:', error.message);
  process.exit(1);
}
