import jwt from 'jsonwebtoken';

import crypto from 'crypto';

export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m'
  });
};

export const generateRefreshTokenString = () => {
  return crypto.randomBytes(40).toString('hex');
};

