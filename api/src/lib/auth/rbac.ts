import type { SessionWithUser } from "./session";

export const PERMISSIONS = {
  "sites:read": "View sites",
  "sites:write": "Create/edit sites",
  "sites:delete": "Delete sites",
  "content:read": "View content",
  "content:write": "Edit content",
  "content:publish": "Publish content",
  "content:delete": "Delete content",
  "components:read": "View components",
  "components:write": "Create/edit components",
  "components:delete": "Delete components",
  "assets:read": "View assets",
  "assets:write": "Upload assets",
  "assets:delete": "Delete assets",
  "users:read": "View users",
  "users:write": "Create/edit users",
  "users:delete": "Delete users",
  "audit:read": "View audit logs",
  "security:read": "View security events",
  "security:manage": "Manage security settings",
  "settings:read": "View settings",
  "settings:write": "Edit settings",
} as const;

export type Permission = keyof typeof PERMISSIONS;

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: Object.keys(PERMISSIONS) as Permission[],
  ADMIN: [
    "sites:read", "sites:write", "content:read", "content:write", "content:publish",
    "content:delete", "components:read", "components:write", "components:delete",
    "assets:read", "assets:write", "assets:delete", "users:read", "audit:read",
    "settings:read", "settings:write",
  ],
  EDITOR: [
    "sites:read", "content:read", "content:write", "components:read", "assets:read", "assets:write",
  ],
  VIEWER: [
    "sites:read", "content:read", "components:read", "assets:read",
  ],
};

export function isSuperAdmin(session: SessionWithUser): boolean {
  return session.user.siteMembers.some((m) => m.role.name === "SUPER_ADMIN");
}

export function hasPermission(session: SessionWithUser, permission: Permission, siteId?: string): boolean {
  if (isSuperAdmin(session)) return true;

  if (siteId) {
    const membership = session.user.siteMembers.find((m) => m.siteId === siteId);
    if (!membership) return false;
    const rolePerms = ROLE_PERMISSIONS[membership.role.name] || [];
    return rolePerms.includes(permission);
  }

  return session.user.siteMembers.some((m) => {
    const rolePerms = ROLE_PERMISSIONS[m.role.name] || [];
    return rolePerms.includes(permission);
  });
}

export function requirePermission(session: SessionWithUser, permission: Permission, siteId?: string): void {
  if (!hasPermission(session, permission, siteId)) {
    throw new PermissionDeniedError(permission);
  }
}

export class PermissionDeniedError extends Error {
  constructor(permission: string) {
    super(`Permission denied: ${permission}`);
    this.name = "PermissionDeniedError";
  }
}

export function getUserSites(session: SessionWithUser) {
  if (isSuperAdmin(session)) return null;
  return session.user.siteMembers.map((m) => m.siteId);
}
