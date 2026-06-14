import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const siteId = url.searchParams.get("siteId");
  if (!siteId) return NextResponse.json({ error: "siteId required" }, { status: 400 });
  const config = await prisma.siteConfig.findUnique({ where: { siteId } });
  const theme = await prisma.siteTheme.findUnique({ where: { siteId } });
  return NextResponse.json({ config, theme });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (body.siteId && body.config) {
      await prisma.siteConfig.upsert({
        where: { siteId: body.siteId },
        update: body.config,
        create: { siteId: body.siteId, ...body.config },
      });
    }
    if (body.siteId && body.theme) {
      await prisma.siteTheme.upsert({
        where: { siteId: body.siteId },
        update: body.theme,
        create: { siteId: body.siteId, ...body.theme },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
