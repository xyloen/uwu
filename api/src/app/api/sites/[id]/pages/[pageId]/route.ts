import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PageBuilder } from "@/lib/cms/page-builder";

export async function POST(request: Request, { params }: { params: Promise<{ id: string; pageId: string }> }) {
  const { id: siteId, pageId } = await params;
  try {
    const body = await request.json();
    if (body.action === "save") {
      const result = await PageBuilder.savePageDraft(pageId, body.userId, body.blocks, body.metadata);
      return NextResponse.json(result);
    }
    if (body.action === "publish") {
      const result = await PageBuilder.publishPage(pageId, body.userId);
      return NextResponse.json(result);
    }
    if (body.action === "blocks") {
      await prisma.contentBlock.deleteMany({ where: { pageId } });
      if (body.blocks?.length) {
        await prisma.contentBlock.createMany({
          data: body.blocks.map((b: any, i: number) => ({
            siteId, pageId, componentType: b.componentType, componentDefId: b.componentDefId,
            data: b.data, order: i, styleOptions: b.styleOptions || {}, visible: b.visible !== false,
          })),
        });
      }
      const updated = await prisma.page.findUnique({ where: { id: pageId }, include: { contentBlocks: { orderBy: { order: "asc" } } } });
      return NextResponse.json(updated);
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Page update error:", error);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}
