import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serialize } from "@/lib/serialize";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const siteId = url.searchParams.get("siteId");
  const where = siteId ? { siteId } : {};
  const assets = await prisma.asset.findMany({ where, orderBy: { createdAt: "desc" } });
  return NextResponse.json(serialize(assets));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const asset = await prisma.asset.create({
      data: {
        siteId: body.siteId,
        filename: body.filename,
        originalName: body.originalName,
        mimeType: body.mimeType,
        size: BigInt(body.size || 0),
        url: body.url,
        type: body.type || "OTHER",
        alt: body.alt || null,
        title: body.title || null,
        width: body.width || null,
        height: body.height || null,
        uploadedBy: body.uploadedBy,
      },
    });
    return NextResponse.json(serialize(asset), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create asset" }, { status: 500 });
  }
}
