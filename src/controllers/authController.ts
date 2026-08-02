import { Request, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: '30d' });
};

const isSecureRequest = (req: Request) => {
  const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0].trim();
  return req.secure || forwardedProto === 'https';
};

const setCookie = (req: Request, res: Response, token: string) => {
  const secure = isSecureRequest(req);
  res.cookie('token', token, {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const user = await User.create({ email, password, name });
  const token = generateToken(user._id.toString());

  setCookie(req, res, token);
  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email } });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken(user._id.toString());
  setCookie(req, res, token);
  res.json({ user: { id: user._id, name: user.name, email: user.email } });
};

export const logout = (req: Request, res: Response) => {
  const secure = isSecureRequest(req);
  res.clearCookie('token', {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
  });
  res.json({ message: 'Logged out' });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  res.json({ id: user._id, name: user.name, email: user.email });
};
