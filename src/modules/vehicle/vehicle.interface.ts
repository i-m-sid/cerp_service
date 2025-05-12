import { Decimal } from "@prisma/client/runtime/library";

export interface ICreateVehicle {
  vehicleNumber: string;
  type: string;
  registeredAt?: Date;
  isActive?: boolean;
  ownerId?: string;
  lastFuelOdometerReading?: Decimal;
  lastServiceOdometerReading?: Decimal;
  lastServiceDate?: Date;
  orgId: string;
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
  orgId: string;
  lastFuelOdometerReading?: Decimal;
  lastServiceOdometerReading?: Decimal;
  lastServiceDate?: Date;
}
