import { UserRole } from '@prisma/client';
import { IAddress } from '../party/party.interface';

export interface ICreateOrganization {
  orgName: string;
  legalName: string;
  tradeName?: string;
  gstNumber?: string;
  phoneNumber?: string;
  email?: string;
  address?: IAddress;
  createdBy: string;
  notes?: string;
  termsAndConditions?: string;
}

export interface IUpdateOrganization {
  id: string;
  orgName?: string;
  legalName?: string;
  tradeName?: string;
  gstNumber?: string;
  phoneNumber?: string;
  email?: string;
  address?: IAddress;
  notes?: string;
  termsAndConditions?: string;
}

export interface ICreateOrganizationMembership {
  userEmailId: string;
  orgId: string;
  role: UserRole;
}

export interface IUpdateOrganizationMembership {
  id: string;
  role: UserRole;
}

export interface IOrganizationWithRole {
  id: string;
  orgName: string;
  legalName: string;
  tradeName?: string;
  gstNumber?: string;
  phoneNumber?: string;
  email?: string;
  address?: IAddress;
  createdAt: Date;
  role: UserRole;
  notes?: string;
  termsAndConditions?: string;
}
