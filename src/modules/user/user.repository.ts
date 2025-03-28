import { PrismaClient, User } from '@prisma/client';

export interface CreateUserData {
  email: string;
  name?: string;
  picture?: string;
}

export interface UpdateUserData {
  name?: string;
  picture?: string;
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

  async update(id: string, data: UpdateUserData): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async upsertByEmail(
    email: string,
    createData: CreateUserData,
    updateData: UpdateUserData,
  ): Promise<User> {
    return this.prisma.user.upsert({
      where: { email },
      create: createData,
      update: updateData,
    });
  }
}
