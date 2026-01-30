import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { verifyRefreshToken, generateAccessToken } from '../utils/jwt.utils';
import { AuthRequest } from '../types';

export const AuthController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, username, password } = req.body;
      const result = await AuthService.register({ email, username, password });

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      res.status(401).json({
        error: error instanceof Error ? error.message : 'Login failed',
      });
    }
  },

  async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  },

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json({ error: 'No refresh token provided' });
        return;
      }

      const payload = verifyRefreshToken(refreshToken);
      if (!payload) {
        res.status(401).json({ error: 'Invalid refresh token' });
        return;
      }

      const accessToken = generateAccessToken(payload);

      res.json({ accessToken });
    } catch (error) {
      res.status(401).json({ error: 'Token refresh failed' });
    }
  },

  async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      res.json({ user: req.user });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user info' });
    }
  },
};
