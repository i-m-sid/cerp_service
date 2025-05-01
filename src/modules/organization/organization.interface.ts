import { UserRole, InvoiceType } from '@prisma/client';
import { IAddress } from '../party/party.interface';

export interface IDocumentConfig {
  prefix: string;
  suffix: string;
  currentNumber: string;
}

export interface IOrganizationConfig {
  notes?: Record<InvoiceType, string>;
  termsAndConditions?: Record<InvoiceType, string>;
  challanHistoryFieldOrder?: Record<string, string[]>;
  challanReportFieldOrder?: Record<string, string[]>;
  challanSummaryFieldOrder?: Record<string, string[]>;
  challanSummationFields?: Record<string, string[]>;
  challanDefaultStatus?: Record<string, string>;
  invoiceTypeToChallanStatus?: Record<string, Record<InvoiceType, string>>;
  invoice?: IDocumentConfig;
  proForma?: IDocumentConfig;
  quote?: IDocumentConfig;
  purchaseOrder?: IDocumentConfig;
  journal?: IDocumentConfig;
}

export interface ICreateOrganization {
  orgName: string;
  legalName: string;
  tradeName?: string;
  gstNumber?: string;
  phoneNumber?: string;
  email?: string;
  address?: IAddress;
  createdBy: string;
  config?: IOrganizationConfig;
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
  config?: IOrganizationConfig;
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
  config?: IOrganizationConfig;
}
