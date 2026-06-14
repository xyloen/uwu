import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serialize } from "@/lib/serialize";

export async function GET() {
  const sites = await prisma.site.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { pages: true, members: true } } },
  });
  return NextResponse.json(serialize(sites));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const site = await prisma.site.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        domain: body.domain || null,
      },
    });
    await prisma.siteConfig.create({ data: { siteId: site.id } });
    await prisma.siteTheme.create({ data: { siteId: site.id } });
    return NextResponse.json(serialize(site), { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "A site with this slug or domain already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create site" }, { status: 500 });
  }
}
