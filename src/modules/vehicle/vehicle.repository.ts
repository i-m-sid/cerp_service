import { PrismaClient } from '@prisma/client';
import {
  IUpdateVehicle,
  IInternalCreateVehicle,
  ICreateVehicle,
} from './vehicle.interface';

export class VehicleRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private readonly include = {
    owner: false,
  };

  async create(data: ICreateVehicle) {
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

  async findAll(orgId: string) {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { orgId },
      include: this.include,
      orderBy: {
        vehicleNumber: 'asc',
      },
    });
    return vehicles;
  }

  async findById(id: string, orgId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, orgId },
      include: this.include,
    });
    return vehicle;
  }

  async findByVehicleNumber(vehicleNumber: string, orgId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { vehicleNumber, orgId },
      include: this.include,
    });
    return vehicle;
  }

  async findByOwner(ownerId: string, orgId: string) {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { ownerId, orgId },
      include: this.include,
      orderBy: {
        vehicleNumber: 'asc',
      },
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
