import jwt from 'jsonwebtoken';
import { compare, hash } from 'bcrypt';
import {
  RegisterInput,
  LoginInput,
  AuthResponse,
  JWTPayload,
  UserResponse,
} from './auth.types';
import { UserRepository } from '../user/user.repository';
import { prisma } from '../../lib/prisma.service';

export class AuthService {
  private userRepository: UserRepository;
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: number;
  private readonly SALT_ROUNDS = 10;

  constructor() {
    this.userRepository = new UserRepository(prisma);
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

    // Convert expiration time to seconds
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
    this.JWT_EXPIRES_IN = expiresIn.includes('d')
      ? parseInt(expiresIn) * 24 * 60 * 60
      : parseInt(expiresIn) || 86400; // Default to 1 day in seconds
  }

  /**
   * Register a new user
   * @param registerData - Registration data including email, password, and name fields
   */
  async register(registerData: RegisterInput): Promise<AuthResponse> {
    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(
      registerData.email,
    );
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hash(registerData.password, this.SALT_ROUNDS);

    // Create user
    const newUser = await this.userRepository.create({
      email: registerData.email,
      password: hashedPassword,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
    });

    // Generate JWT
    const accessToken = this.generateToken(newUser.id, newUser.email);

    return {
      user: this.mapUserToResponse(newUser),
      accessToken,
    };
  }

  /**
   * Login user with email and password
   * @param loginData - Login credentials
   */
  async login(loginData: LoginInput): Promise<AuthResponse> {
    // Find user by email
    const user = await this.userRepository.findByEmail(loginData.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await compare(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT
    const accessToken = this.generateToken(user.id, user.email);

    return {
      user: this.mapUserToResponse(user),
      accessToken,
    };
  }

  /**
   * Verify JWT token
   * @param token - JWT token to verify
   */
  async verifyJWT(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
      const user = await this.userRepository.findById(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Generate JWT token
   * @private
   */
  private generateToken(userId: string, email: string): string {
    return jwt.sign(
      {
        userId,
        email,
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN },
    );
  }

  /**
   * Map user entity to response type
   * @private
   */
  private mapUserToResponse(user: any): UserResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
    };
  }
}
