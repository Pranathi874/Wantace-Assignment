export function requireOwnerAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Authentication required' });

  const [type, credentials] = authHeader.split(' ');
  if (type !== 'Basic' || !credentials) return res.status(401).json({ error: 'Invalid auth' });

  const decoded = Buffer.from(credentials, 'base64').toString();
  const [user, pass] = decoded.split(':');

  const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'roofing2026!';

  if (user === ADMIN_USER && pass === ADMIN_PASS) return next();

  return res.status(401).json({ error: 'Invalid credentials' });
}
