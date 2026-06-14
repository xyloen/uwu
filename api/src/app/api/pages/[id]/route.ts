import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serialize } from "@/lib/serialize";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await prisma.page.findUnique({
    where: { id },
    include: {
      contentBlocks: { orderBy: { order: "asc" } },
      contentVersions: { orderBy: { version: "desc" }, take: 10 },
      site: { select: { id: true, name: true } },
    },
  });
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  return NextResponse.json(serialize(page));
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const page = await prisma.page.update({ where: { id }, data: body });
    return NextResponse.json(serialize(page));
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.page.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
