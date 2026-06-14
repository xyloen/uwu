import prisma from "@/lib/prisma";
import type { AuditAction, SecurityEventType } from "@prisma/client";

interface LogAuditParams {
  userId: string;
  siteId?: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress: string;
  userAgent?: string;
  details?: Record<string, any>;
}

export async function logAudit(params: LogAuditParams) {
  return prisma.auditLog.create({
    data: {
      userId: params.userId,
      siteId: params.siteId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValue: params.oldValue ? params.oldValue : undefined,
      newValue: params.newValue ? params.newValue : undefined,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      details: params.details || {},
    },
  });
}

interface LogSecurityEventParams {
  userId?: string;
  type: SecurityEventType;
  ipAddress: string;
  userAgent?: string;
  details?: Record<string, any>;
}

export async function logSecurityEvent(params: LogSecurityEventParams) {
  return prisma.securityEvent.create({
    data: {
      userId: params.userId,
      type: params.type,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      details: params.details || {},
    },
  });
}
