import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

export function validateEnvironment(env = process.env) {
  if (!env.MONGODB_URI) throw new Error('MONGODB_URI is required.');
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters.');
  if (env.JWT_SECRET === env.DATA_ENCRYPTION_KEY) throw new Error('JWT_SECRET and DATA_ENCRYPTION_KEY must be different.');
  if (!env.DATA_ENCRYPTION_KEY || !/^[a-f0-9]{64}$/i.test(env.DATA_ENCRYPTION_KEY)) throw new Error('DATA_ENCRYPTION_KEY must be 64 hex characters (32 random bytes).');
}
export function encrypt(value) {
  if (value == null || value === '') return value;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(process.env.DATA_ENCRYPTION_KEY, 'hex'), iv);
  const body = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  return [iv.toString('base64'), cipher.getAuthTag().toString('base64'), body.toString('base64')].join('.');
}
export function decrypt(value) {
  if (value == null || value === '') return value;
  const [iv, tag, body] = value.split('.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(process.env.DATA_ENCRYPTION_KEY, 'hex'), Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(body, 'base64')), decipher.final()]).toString('utf8');
}
export const issueToken = user => jwt.sign({ sub: String(user._id), v: user.tokenVersion }, process.env.JWT_SECRET, { expiresIn: '2h', issuer: 'inclusive-campus', audience: 'campus-api', algorithm: 'HS256' });
export const verifyToken = token => jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'], issuer: 'inclusive-campus', audience: 'campus-api' });
export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
export const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
