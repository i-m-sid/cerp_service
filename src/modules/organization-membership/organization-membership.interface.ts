import { UserRole } from '@prisma/client';

export interface ICreateOrganizationMembership {
  userEmailId: string;
  role: UserRole;
}

export interface IUpdateOrganizationMembership {
  id: string;
  role: UserRole;
}
