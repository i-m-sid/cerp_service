import type { UserRole } from '@prisma/client';
import { IAddress } from '../party/party.interface';

export interface ICreateOrganization {
  legalName: string;
  tradeName?: string;
  gstNumber?: string;
  phoneNumber?: string;
  email?: string;
  address?: IAddress;
  createdBy: string;
}

export interface IUpdateOrganization {
  id: string;
  legalName?: string;
  tradeName?: string;
  gstNumber?: string;
  phoneNumber?: string;
  email?: string;
  address?: IAddress;
}

export interface ICreateOrganizationMembership {
  userId: string;
  orgId: string;
  role: UserRole;
}

export interface IUpdateOrganizationMembership {
  id: string;
  role?: UserRole;
}
