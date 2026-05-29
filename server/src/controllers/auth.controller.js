import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/prisma.js';
import { signToken } from '../utils/token.js';

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, isAdmin: u.isAdmin });

const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, passwordHash } });
    const token = signToken({ id: user.id });
    res.status(201).json({ user: publicUser(user), token });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ id: user.id });
    res.json({ user: publicUser(user), token });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res) => {
  res.json({ user: req.user });
};

// POST /api/auth/google  -> login or signup with a Google account
export const googleLogin = async (req, res, next) => {
  try {
    if (!googleClient)
      return res.status(503).json({ message: 'Google login is not configured' });

    const { credential } = req.body; // Google ID token (JWT)
    if (!credential) return res.status(400).json({ message: 'Missing Google credential' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) return res.status(401).json({ message: 'Invalid Google token' });

    const email = payload.email;
    const name = payload.name || email.split('@')[0];
    const googleId = payload.sub;

    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      // link the Google id to an existing account if not already linked
      if (!user.googleId) {
        user = await prisma.user.update({ where: { id: user.id }, data: { googleId } });
      }
    } else {
      user = await prisma.user.create({ data: { name, email, googleId } });
    }

    const token = signToken({ id: user.id });
    res.json({ user: publicUser(user), token });
  } catch (err) {
    next(err);
  }
};
