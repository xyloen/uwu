import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export class ComponentRegistry {
  
  static async registerComponent(siteId: string | null, def: Omit<Prisma.ComponentDefinitionCreateInput, "site">) {
    const existing = await prisma.componentDefinition.findFirst({
      where: { siteId, type: def.type },
    });

    if (existing) {
      return prisma.$transaction(async (tx) => {
        const newVersionNum = existing.currentVersion + 1;
        
        await tx.componentVersion.create({
          data: {
            componentDefId: existing.id,
            version: newVersionNum,
            schema: def.schema,
            defaultData: def.defaultData,
            changelog: `Updated to version ${newVersionNum}`,
            isPublished: true,
            publishedAt: new Date(),
          },
        });

        return tx.componentDefinition.update({
          where: { id: existing.id },
          data: {
            ...def,
            currentVersion: newVersionNum,
          },
        });
      });
    }

    return prisma.$transaction(async (tx) => {
      const newDef = await tx.componentDefinition.create({
        data: {
          ...def,
          siteId,
          currentVersion: 1,
        },
      });

      await tx.componentVersion.create({
        data: {
          componentDefId: newDef.id,
          version: 1,
          schema: def.schema,
          defaultData: def.defaultData,
          changelog: "Initial creation",
          isPublished: true,
          publishedAt: new Date(),
        },
      });

      return newDef;
    });
  }

  static async getComponentDefinition(siteId: string | null, type: string) {
    return prisma.componentDefinition.findFirst({
      where: {
        type,
        OR: [{ siteId }, { isGlobal: true }],
      },
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });
  }

  static async listComponents(siteId: string | null) {
    return prisma.componentDefinition.findMany({
      where: {
        OR: [{ siteId }, { isGlobal: true }],
        isActive: true,
      },
      orderBy: [{ category: "asc" }, { label: "asc" }],
    });
  }

}
