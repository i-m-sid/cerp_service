export interface ICreateVehicle {
  vehicleNumber: string;
  type: string;
  registeredAt?: Date;
  isActive?: boolean;
  ownerId: string;
  lastFuelOdometerReading?: number;
  lastServiceOdometerReading?: number;
  lastServiceDate?: Date;
}

export interface IUpdateVehicle extends Partial<ICreateVehicle> {
  id: string;
}
