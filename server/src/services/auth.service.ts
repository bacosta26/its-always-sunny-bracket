import { UserModel, CreateUserDTO } from '../models/user.model';
import { hashPassword, comparePassword, validatePassword } from '../utils/password.utils';
import { generateAccessToken, generateRefreshToken, JWTPayload } from '../utils/jwt.utils';

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    isAdmin: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export const AuthService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    // Validate password
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    // Check if email already exists
    const existingEmail = await UserModel.findByEmail(data.email);
    if (existingEmail) {
      throw new Error('Email already in use');
    }

    // Check if username already exists
    const existingUsername = await UserModel.findByUsername(data.username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Hash password
    const password_hash = await hashPassword(data.password);

    // Create user
    const user = await UserModel.create({
      email: data.email,
      username: data.username,
      password_hash,
    });

    // Generate tokens
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      isAdmin: user.is_admin,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.is_admin,
      },
      accessToken,
      refreshToken,
    };
  },

  async login(data: LoginData): Promise<AuthResponse> {
    // Find user by email
    const user = await UserModel.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await comparePassword(data.password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      isAdmin: user.is_admin,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.is_admin,
      },
      accessToken,
      refreshToken,
    };
  },
};
