import {
  ICreateVehicle,
  IUpdateVehicle,
  IInternalCreateVehicle,
} from './vehicle.interface';
import { VehicleRepository } from './vehicle.repository';

export class VehicleService {
  private repository: VehicleRepository;

  constructor() {
    this.repository = new VehicleRepository();
  }

  async create(data: ICreateVehicle) {
    // Check if vehicle number already exists
    const existing = await this.repository.findByVehicleNumber(
      data.vehicleNumber,
      data.orgId,
    );
    if (existing) {
      throw new Error('Vehicle with this number already exists');
    }
    return this.repository.create(data);
  }

  async findAll(orgId: string) {
    return this.repository.findAll(orgId);
  }

  async findById(id: string, orgId: string) {
    return this.repository.findById(id, orgId);
  }

  async findByOwner(ownerId: string, orgId: string) {
    return this.repository.findByOwner(ownerId, orgId);
  }

  async update(data: IUpdateVehicle) {
    // If vehicle number is being updated, check if new number already exists
    if (data.vehicleNumber) {
      const existing = await this.repository.findByVehicleNumber(
        data.vehicleNumber,
        data.orgId,
      );
      if (existing && existing.id !== data.id) {
        throw new Error('Vehicle with this number already exists');
      }
    }
    return this.repository.update(data);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
