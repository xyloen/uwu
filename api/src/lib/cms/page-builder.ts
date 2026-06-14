import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export class PageBuilder {
  static async getPageWithBlocks(siteId: string, slug: string) {
    return prisma.page.findUnique({
      where: { siteId_slug: { siteId, slug } },
      include: {
        contentBlocks: {
          where: { visible: true },
          orderBy: { order: "asc" },
        },
      },
    });
  }

  static async savePageDraft(pageId: string, userId: string, blocks: any[], metadata?: any) {
    return prisma.$transaction(async (tx) => {
      const page = await tx.page.findUnique({ where: { id: pageId }, include: { contentBlocks: true } });
      if (!page) throw new Error("Page not found");

      // Snapshot for versioning
      const currentVersion = await tx.contentVersion.count({ where: { pageId } });
      await tx.contentVersion.create({
        data: {
          pageId,
          version: currentVersion + 1,
          snapshot: { blocks: page.contentBlocks, metadata: page.metadata },
          changedBy: userId,
          changeNote: "Auto-save draft",
        },
      });

      // Delete old blocks
      await tx.contentBlock.deleteMany({ where: { pageId } });

      // Create new blocks
      if (blocks && blocks.length > 0) {
        await tx.contentBlock.createMany({
          data: blocks.map((b: any, i: number) => ({
            siteId: page.siteId,
            pageId,
            componentType: b.componentType,
            componentDefId: b.componentDefId,
            data: b.data,
            order: i,
            styleOptions: b.styleOptions || {},
            visible: b.visible !== false,
          })),
        });
      }

      if (metadata) {
        await tx.page.update({ where: { id: pageId }, data: { metadata } });
      }

      return this.getPageWithBlocks(page.siteId, page.slug);
    });
  }

  static async publishPage(pageId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const page = await tx.page.update({
        where: { id: pageId },
        data: { status: "PUBLISHED", publishAt: new Date() },
      });

      await tx.auditLog.create({
        data: {
          userId,
          siteId: page.siteId,
          action: "PUBLISH",
          entityType: "Page",
          entityId: pageId,
          ipAddress: "127.0.0.1", // In real implementation, pass this down
        },
      });

      return page;
    });
  }
}
