import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  picture: z.string().nullable(),
  googleId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date(),
  isActive: z.boolean(),
  refreshToken: z.string().nullable(),
});

export type User = z.infer<typeof UserSchema>;

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
}
