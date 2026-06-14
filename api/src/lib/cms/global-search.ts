import prisma from "@/lib/prisma";

export class GlobalSearch {
  static async search(query: string, siteId?: string, limit = 10) {
    if (!query || query.length < 2) return { sites: [], pages: [], components: [], assets: [] };

    const [sites, pages, components, assets] = await Promise.all([
      siteId ? Promise.resolve([]) : prisma.site.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
          ],
        },
        take: limit,
        select: { id: true, name: true, slug: true, status: true },
      }),
      prisma.page.findMany({
        where: {
          siteId: siteId || undefined,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: limit,
        select: { id: true, title: true, slug: true, status: true, siteId: true },
      }),
      prisma.componentDefinition.findMany({
        where: siteId
          ? { AND: [{ OR: [{ type: { contains: query, mode: "insensitive" } }, { label: { contains: query, mode: "insensitive" } }] }, { OR: [{ siteId }, { isGlobal: true }] }] }
          : { OR: [{ type: { contains: query, mode: "insensitive" } }, { label: { contains: query, mode: "insensitive" } }] },
        take: limit,
        select: { id: true, type: true, label: true, category: true, isGlobal: true },
      }),
      prisma.asset.findMany({
        where: {
          siteId: siteId || undefined,
          OR: [
            { filename: { contains: query, mode: "insensitive" } },
            { originalName: { contains: query, mode: "insensitive" } },
            { alt: { contains: query, mode: "insensitive" } },
          ],
        },
        take: limit,
        select: { id: true, filename: true, originalName: true, type: true, url: true, siteId: true },
      }),
    ]);

    return { sites, pages, components, assets };
  }
}
