import { OAuth2Client } from 'google-auth-library';
import jwt, { SignOptions } from 'jsonwebtoken';
import {
  GoogleUser,
  GoogleUserSchema,
  JWTPayload,
  AuthResponse,
} from './auth.types';
import { UserRepository } from '../user/user.repository';
import { prisma } from '../../lib/prisma.service';
import { UserSchema } from '../user/user.types';

export class AuthService {
  private userRepository: UserRepository;
  private googleClient: OAuth2Client;
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: number;

  constructor() {
    this.userRepository = new UserRepository(prisma);
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

    // Convert expiration time to seconds
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
    this.JWT_EXPIRES_IN = expiresIn.includes('d')
      ? parseInt(expiresIn) * 24 * 60 * 60
      : parseInt(expiresIn) || 86400; // Default to 1 day in seconds
  }

  /**
   * Verify Google ID token and return user information
   * @param idToken - Google ID token from client
   */
  async verifyGoogleToken(idToken: string): Promise<GoogleUser> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid token payload');
      }

      const googleUser = {
        email: payload.email!,
        name: payload.name,
        picture: payload.picture,
        sub: payload.sub,
      };

      const validatedUser = GoogleUserSchema.parse(googleUser);
      return validatedUser;
    } catch (error) {
      throw new Error('Invalid Google token');
    }
  }

  /**
   * Create or update user in database and return auth response
   * @param googleUser - Validated Google user information
   */
  async authenticateUser(googleUser: GoogleUser): Promise<AuthResponse> {
    const user = await this.userRepository.upsertByEmail(
      googleUser.email,
      {
        email: googleUser.email,
        name: googleUser.name || undefined,
        picture: googleUser.picture || undefined,
      },
      {
        name: googleUser.name || undefined,
        picture: googleUser.picture || undefined,
        updatedAt: new Date(),
      },
    );

    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN },
    );

    console.log('accessToken', accessToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
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

      const validatedUser = UserSchema.parse(user);
      if (!validatedUser.isActive) {
        throw new Error('User is inactive');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
