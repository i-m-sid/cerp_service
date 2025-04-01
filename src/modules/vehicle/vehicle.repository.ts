import { PrismaClient } from '@prisma/client';
import {
  IUpdateVehicle,
  IInternalCreateVehicle,
} from './vehicle.interface';

export class VehicleRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private readonly include = {
    owner: false,
  };

  async create(data: IInternalCreateVehicle) {
    const { registeredAt, lastServiceDate, ...rest } = data;
    const vehicle = await this.prisma.vehicle.create({
      data: {
        ...rest,
        registeredAt: registeredAt ? new Date(registeredAt) : null,
        lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : null,
      },
      include: this.include,
    });
    return vehicle;
  }

  async findAll() {
    const vehicles = await this.prisma.vehicle.findMany({
      include: this.include,
    });
    return vehicles;
  }

  async findById(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: this.include,
    });
    return vehicle;
  }

  async findByVehicleNumber(vehicleNumber: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { vehicleNumber },
      include: this.include,
    });
    return vehicle;
  }

  async findByOwner(ownerId: string) {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { ownerId },
      include: this.include,
    });
    return vehicles;
  }

  async update(data: IUpdateVehicle) {
    const { id, registeredAt, lastServiceDate, ...updateData } = data;
    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data: {
        ...updateData,
        registeredAt: registeredAt ? new Date(registeredAt) : undefined,
        lastServiceDate: lastServiceDate
          ? new Date(lastServiceDate)
          : undefined,
      },
      include: this.include,
    });
    return vehicle;
  }

  async delete(id: string) {
    const vehicle = await this.prisma.vehicle.delete({
      where: { id },
      include: this.include,
    });
    return vehicle;
  }
}
