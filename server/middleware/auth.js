import { User } from '../models/index.js';
import { asyncRoute, HttpError, verifyToken } from '../security.js';
export const authenticate = asyncRoute(async (req, _res, next) => {
  const token = req.headers.authorization?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) throw new HttpError(401, 'Authentication required.');
  let claims;
  try { claims = verifyToken(token); } catch { throw new HttpError(401, 'Invalid or expired session.'); }
  if(typeof claims.sub!=='string'||!/^[a-f\d]{24}$/i.test(claims.sub)||!Number.isInteger(claims.v))throw new HttpError(401,'Invalid session claims.');
  const user = await User.findById(claims.sub);
  if (!user?.active || user.tokenVersion !== claims.v) throw new HttpError(401, 'Session revoked.');
  req.user = user; next();
});
export const authorize = (...roles) => (req, _res, next) => roles.includes(req.user?.role) ? next() : next(new HttpError(403, 'This role cannot access this resource.'));
