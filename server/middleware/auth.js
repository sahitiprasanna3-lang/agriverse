import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { store } from '../store.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'kisansetu_jwt_secret_key_2026_secured';

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function protect(req, res, next) {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    let user = null;
    if (isDbConnected()) {
      try {
        user = await User.findOne({ id: decoded.id }).select('-password');
      } catch (e) {
        // Fallback
      }
    }

    if (!user) {
      user = store.users.find((u) => u.id === decoded.id);
    }

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized, token invalid or expired' });
  }
}

export async function optionalAuth(req, res, next) {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      let user = null;
      if (isDbConnected()) {
        try {
          user = await User.findOne({ id: decoded.id }).select('-password');
        } catch (e) {
          // ignore
        }
      }
      if (!user) {
        user = store.users.find((u) => u.id === decoded.id);
      }
      if (user) req.user = user;
    } catch (e) {
      // Ignore
    }
  }

  next();
}

export function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const isDesignatedAdmin =
      req.user.email === 'chinnagoudmallepula@gmail.com' ||
      req.user.email === 'kisanadmin@gmail.com' ||
      req.user.email === 'iamajaz8055@gmail.com' ||
      req.user.email === 'ajazahmedmd7@gmail.com';

    if (isDesignatedAdmin) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Role '${req.user.role}' is not authorized for this resource.`,
      });
    }

    next();
  };
}
