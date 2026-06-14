import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serialize } from "@/lib/serialize";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const site = await prisma.site.findUnique({
    where: { id },
    include: {
      pages: { orderBy: { order: "asc" } },
      siteConfig: true,
      theme: true,
      members: { include: { user: { select: { id: true, name: true, email: true } }, role: true } },
      _count: { select: { assets: true, contentBlocks: true } },
    },
  });
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
  return NextResponse.json(serialize(site));
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const site = await prisma.site.update({ where: { id }, data: body });
    return NextResponse.json(serialize(site));
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Slug or domain already taken" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update site" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.site.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
