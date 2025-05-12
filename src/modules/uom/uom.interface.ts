import { Decimal } from "@prisma/client/runtime/library";

export interface ICreateUOM {
  label: string; // e.g., "Kilogram"
  shortCode: string; // e.g., "kg"
  orgId: string;
  baseUQC: string;
  baseConversionFactor: Decimal;
}

export interface IBaseUOM {
  label: string;
  UQC: string;
}

export interface IInternalCreateUOM extends ICreateUOM {
  createdBy: string;
}

export interface IUpdateUOM extends Partial<ICreateUOM> {
  id: string;
}
