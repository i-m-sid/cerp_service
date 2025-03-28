import { z } from 'zod';

export const GoogleUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  picture: z.string().url().optional(),
  sub: z.string(), // This is the Google ID
});

export type GoogleUser = z.infer<typeof GoogleUserSchema>;

export const AuthResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
    picture: z.string().nullable(),
  }),
  accessToken: z.string(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}
