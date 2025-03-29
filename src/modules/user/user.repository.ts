import { PrismaClient, User } from '@prisma/client';

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  picture?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  picture?: string;
  password?: string;
  updatedAt?: Date;
}

export class UserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: data,
    });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: data,
    });
  }

  async upsertByEmail(
    email: string,
    createData: CreateUserData,
    updateData: UpdateUserData,
  ): Promise<User> {
    try {
      const user = await this.prisma.user.upsert({
        where: { email },
        create: createData,
        update: updateData,
      });
      return user;
    } catch (error) {
      console.error('Error upserting user', error);
      throw error;
    }
  }
}
