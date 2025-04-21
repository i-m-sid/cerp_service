import { UserRole } from "@prisma/client";

const roleRank: Record<UserRole, number> = {
  OWNER: 0,
  ADMIN: 1,
  MANAGER: 2,
  ACCOUNTANT: 3,
  DATA_ENTRY: 4,
  VIEWER: 5,
};

export function isUserRoleAccessible(role: UserRole, accessLevel: UserRole) {
  return roleRank[role] <= roleRank[accessLevel];
}
