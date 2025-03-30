export interface ICreateVehicle {
  vehicleNumber: string;
  type: string;
  registeredAt?: Date;
  isActive?: boolean;
  ownerId?: string;
  lastFuelOdometerReading?: number;
  lastServiceOdometerReading?: number;
  lastServiceDate?: Date;
}

export interface IInternalCreateVehicle extends ICreateVehicle {
  createdBy: string;
}

export interface IUpdateVehicle {
  id: string;
  vehicleNumber?: string;
  type?: string;
  registeredAt?: Date;
  isActive?: boolean;
  ownerId?: string;
  lastFuelOdometerReading?: number;
  lastServiceOdometerReading?: number;
  lastServiceDate?: Date;
}
