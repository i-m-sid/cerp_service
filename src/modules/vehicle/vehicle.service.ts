import { ICreateVehicle, IUpdateVehicle } from './vehicle.interface';
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
    );
    if (existing) {
      throw new Error('Vehicle with this number already exists');
    }
    return this.repository.create(data);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async findByOwner(ownerId: string) {
    return this.repository.findByOwner(ownerId);
  }

  async update(data: IUpdateVehicle) {
    // If vehicle number is being updated, check if new number already exists
    if (data.vehicleNumber) {
      const existing = await this.repository.findByVehicleNumber(
        data.vehicleNumber,
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
