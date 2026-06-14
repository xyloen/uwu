import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serialize } from "@/lib/serialize";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const siteId = url.searchParams.get("siteId");
  const where = siteId ? { siteId } : {};
  const pages = await prisma.page.findMany({
    where,
    orderBy: { order: "asc" },
    include: { _count: { select: { contentBlocks: true, contentVersions: true } } },
  });
  return NextResponse.json(serialize(pages));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const page = await prisma.page.create({
      data: {
        siteId: body.siteId,
        title: body.title,
        slug: body.slug,
        description: body.description || null,
        status: body.status || "DRAFT",
        parentId: body.parentId || null,
        order: body.order || 0,
      },
    });
    return NextResponse.json(serialize(page), { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "A page with this slug already exists in this site" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}
