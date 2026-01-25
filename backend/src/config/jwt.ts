import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  id: string; // Alias for userId for backward compatibility
  email: string;
  role: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
};

export const getRefreshTokenExpiry = (): Date => {
  const expiryMs = JWT_REFRESH_EXPIRES_IN.includes('d')
    ? parseInt(JWT_REFRESH_EXPIRES_IN) * 24 * 60 * 60 * 1000
    : parseInt(JWT_REFRESH_EXPIRES_IN) * 60 * 60 * 1000;

  return new Date(Date.now() + expiryMs);
};
