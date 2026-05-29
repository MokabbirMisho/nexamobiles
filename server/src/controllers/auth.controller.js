import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/prisma.js';
import { signToken } from '../utils/token.js';
import { sendWelcomeEmail } from '../services/email.service.js';

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
    sendWelcomeEmail(user); // fire-and-forget
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

// PATCH /api/auth/me  { name?, currentPassword?, newPassword? }
// Lets a logged-in customer update their name and/or password. Email is not editable.
export const updateProfile = async (req, res, next) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const data = {};

    if (typeof name === 'string' && name.trim()) data.name = name.trim();

    if (newPassword) {
      if (newPassword.length < 6)
        return res.status(400).json({ message: 'New password must be at least 6 characters' });

      const full = await prisma.user.findUnique({ where: { id: req.user.id } });
      // If the account already has a password, the current one must match.
      if (full.passwordHash) {
        if (!currentPassword)
          return res.status(400).json({ message: 'Current password is required' });
        const ok = await bcrypt.compare(currentPassword, full.passwordHash);
        if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });
      }
      data.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (!Object.keys(data).length)
      return res.status(400).json({ message: 'Nothing to update' });

    const updated = await prisma.user.update({ where: { id: req.user.id }, data });
    res.json({ user: publicUser(updated) });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/admins  (admin only)  { name, email, password }
// Creates a new admin, or promotes an existing user to admin.
export const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.isAdmin)
        return res.status(409).json({ message: 'That user is already an admin' });
      const promoted = await prisma.user.update({
        where: { id: existing.id },
        data: { isAdmin: true },
      });
      return res.status(200).json({ user: publicUser(promoted), promoted: true });
    }

    if (!name || !password)
      return res.status(400).json({ message: 'Name and password are required for a new admin' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, passwordHash, isAdmin: true } });
    res.status(201).json({ user: publicUser(user), promoted: false });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/auth/me  -> permanently delete the logged-in customer's account
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (req.user.isAdmin)
      return res.status(403).json({ message: 'Admin accounts cannot be deleted here' });

    await prisma.$transaction([
      // Orders have no cascade from User, so remove them first
      // (order items & payment cascade from Order automatically).
      prisma.order.deleteMany({ where: { userId } }),
      // Cart items cascade on user delete, but clearing explicitly is harmless.
      prisma.user.delete({ where: { id: userId } }),
    ]);

    res.json({ message: 'Account deleted' });
  } catch (err) {
    next(err);
  }
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
      sendWelcomeEmail(user); // fire-and-forget for new Google sign-ups
    }

    const token = signToken({ id: user.id });
    res.json({ user: publicUser(user), token });
  } catch (err) {
    next(err);
  }
};
