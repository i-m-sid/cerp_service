import { PrismaClient, Vehicle } from '@prisma/client';
import {
  ICreateVehicle,
  IUpdateVehicle,
  IInternalCreateVehicle,
} from './vehicle.interface';

type VehicleWithRelations = Vehicle & {
  owner?: { id: string; legalName: string } | null;
};

const transformVehicle = (vehicle: VehicleWithRelations) => ({
  ...vehicle,
  lastFuelOdometerReading: vehicle.lastFuelOdometerReading?.toNumber(),
  lastServiceOdometerReading: vehicle.lastServiceOdometerReading?.toNumber(),
});

export class VehicleRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private readonly include = {
    owner: false,
  };

  async create(data: IInternalCreateVehicle) {
    const vehicle = await this.prisma.vehicle.create({
      data,
      include: this.include,
    });
    return transformVehicle(vehicle);
  }

  async findAll() {
    const vehicles = await this.prisma.vehicle.findMany({
      include: this.include,
    });
    return vehicles.map(transformVehicle);
  }

  async findById(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: this.include,
    });
    return vehicle ? transformVehicle(vehicle) : null;
  }

  async findByVehicleNumber(vehicleNumber: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { vehicleNumber },
      include: this.include,
    });
    return vehicle ? transformVehicle(vehicle) : null;
  }

  async findByOwner(ownerId: string) {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { ownerId },
      include: this.include,
    });
    return vehicles.map(transformVehicle);
  }

  async update(data: IUpdateVehicle) {
    const { id, ...updateData } = data;
    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data: updateData,
      include: this.include,
    });
    return transformVehicle(vehicle);
  }

  async delete(id: string) {
    const vehicle = await this.prisma.vehicle.delete({
      where: { id },
      include: this.include,
    });
    return transformVehicle(vehicle);
  }
}
