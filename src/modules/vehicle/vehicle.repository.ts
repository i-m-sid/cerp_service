import { PrismaClient } from '@prisma/client';
import { ICreateVehicle, IUpdateVehicle } from './vehicle.interface';

export class VehicleRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private readonly include = {
    owner: true,
  };

  async create(data: ICreateVehicle) {
    return this.prisma.vehicle.create({
      data,
      include: this.include,
    });
  }

  async findAll() {
    return this.prisma.vehicle.findMany({
      include: this.include,
    });
  }

  async findById(id: string) {
    return this.prisma.vehicle.findUnique({
      where: { id },
      include: this.include,
    });
  }

  async findByVehicleNumber(vehicleNumber: string) {
    return this.prisma.vehicle.findUnique({
      where: { vehicleNumber },
      include: this.include,
    });
  }

  async findByOwner(ownerId: string) {
    return this.prisma.vehicle.findMany({
      where: { ownerId },
      include: this.include,
    });
  }

  async update(data: IUpdateVehicle) {
    const { id, ...updateData } = data;
    return this.prisma.vehicle.update({
      where: { id },
      data: updateData,
      include: this.include,
    });
  }

  async delete(id: string) {
    return this.prisma.vehicle.delete({
      where: { id },
    });
  }
}
