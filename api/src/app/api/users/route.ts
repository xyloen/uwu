import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { serialize } from "@/lib/serialize";

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, status: true,
      lastLoginAt: true, createdAt: true,
      _count: { select: { sessions: true, siteMembers: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(serialize(users));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: { email: body.email, name: body.name, passwordHash, status: body.status || "ACTIVE" },
      select: { id: true, email: true, name: true, status: true },
    });
    return NextResponse.json(serialize(user), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
