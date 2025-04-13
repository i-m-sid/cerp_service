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

  constructor() {
    this.prisma = new PrismaClient();
  }

  private readonly include = {
    memberships: {
      include: {
        organization: true,
      },
    },
  };

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: this.include,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: this.include,
    });
  }

  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: data,
      include: this.include,
    });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: data,
      include: this.include,
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
        include: this.include,
      });
      return user;
    } catch (error) {
      console.error('Error upserting user', error);
      throw error;
    }
  }
}
