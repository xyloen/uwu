import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serialize } from "@/lib/serialize";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const siteId = url.searchParams.get("siteId");
  const components = await prisma.componentDefinition.findMany({
    where: { ...(siteId ? { OR: [{ siteId }, { isGlobal: true }] } : {}), isActive: true },
    orderBy: [{ category: "asc" }, { label: "asc" }],
    include: { _count: { select: { blocks: true } } },
  });
  return NextResponse.json(serialize(components));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const component = await prisma.componentDefinition.create({
      data: {
        siteId: body.siteId || null,
        type: body.type,
        label: body.label,
        icon: body.icon || null,
        category: body.category || "general",
        schema: body.schema || {},
        defaultData: body.defaultData || {},
        styleSchema: body.styleSchema || {},
        isGlobal: body.isGlobal || false,
        currentVersion: 1,
      },
    });
    await prisma.componentVersion.create({
      data: {
        componentDefId: component.id,
        version: 1,
        schema: body.schema || {},
        defaultData: body.defaultData || {},
        changelog: "Initial creation",
        isPublished: true,
        publishedAt: new Date(),
      },
    });
    return NextResponse.json(serialize(component), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create component" }, { status: 500 });
  }
}
