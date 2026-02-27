import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { serialize, parse } from 'cookie'

const JWT_SECRET = process.env.JWT_SECRET || 'saggio_default_secret_change_in_production'
const COOKIE_NAME = 'saggio_token'

export function hashPassword(password) {
  return bcrypt.hashSync(password, 12)
}

export function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash)
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function setAuthCookie(res, token) {
  res.setHeader('Set-Cookie', serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  }))
}

export function clearAuthCookie(res) {
  res.setHeader('Set-Cookie', serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  }))
}

export function getTokenFromRequest(req) {
  const cookies = parse(req.headers.cookie || '')
  return cookies[COOKIE_NAME] || null
}

export function getUserFromRequest(req) {
  const token = getTokenFromRequest(req)
  if (!token) return null
  return verifyToken(token)
}
