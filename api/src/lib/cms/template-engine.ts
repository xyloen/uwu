import prisma from "@/lib/prisma";

export class TemplateEngine {
  static async createSiteFromTemplate(templateId: string, siteParams: { name: string; slug: string; description?: string }) {
    return prisma.$transaction(async (tx) => {
      const template = await tx.siteTemplate.findUnique({
        where: { id: templateId },
        include: { templateBlocks: { orderBy: { order: "asc" } } },
      });

      if (!template) throw new Error("Template not found");

      const site = await tx.site.create({
        data: {
          name: siteParams.name,
          slug: siteParams.slug,
          description: siteParams.description,
          templateId,
        },
      });

      await tx.siteTheme.create({
        data: {
          siteId: site.id,
          name: `Theme from ${template.name}`,
          colors: (template.defaultTheme as any)?.colors || {},
          typography: (template.defaultTheme as any)?.typography || {},
          spacing: (template.defaultTheme as any)?.spacing || {},
          shadows: (template.defaultTheme as any)?.shadows || {},
          borderRadius: (template.defaultTheme as any)?.borderRadius || {},
          animations: (template.defaultTheme as any)?.animations || {},
        },
      });

      await tx.siteConfig.create({
        data: {
          siteId: site.id,
          settings: template.defaultConfig || {},
        },
      });

      // Group template blocks by pageName
      const pagesMap = new Map<string, typeof template.templateBlocks>();
      for (const block of template.templateBlocks) {
        if (!pagesMap.has(block.pageName)) {
          pagesMap.set(block.pageName, []);
        }
        pagesMap.get(block.pageName)!.push(block);
      }

      for (const [pageName, blocks] of pagesMap) {
        const slug = blocks[0].pageSlug;
        const page = await tx.page.create({
          data: {
            siteId: site.id,
            title: pageName,
            slug: slug,
            status: "DRAFT", // Sites created from template start in DRAFT
          },
        });

        if (blocks.length > 0) {
          await tx.contentBlock.createMany({
            data: blocks.map((b) => ({
              siteId: site.id,
              pageId: page.id,
              componentType: b.componentType,
              data: b.defaultData as any,
              order: b.order,
              styleOptions: b.styleOptions as any,
              visible: b.visible,
            })) as any,
          });
        }
      }

      return site;
    });
  }
}
