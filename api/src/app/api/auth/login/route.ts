import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { logSecurityEvent } from "@/lib/security/audit";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.status !== "ACTIVE") {
      await logSecurityEvent({ type: "LOGIN_FAILURE", ipAddress: request.headers.get("x-forwarded-for") || "unknown", userId: user.id, details: { reason: "Account not active" } });
      return NextResponse.json({ error: "Account is not active" }, { status: 403 });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json({ error: "Account is locked. Try again later." }, { status: 423 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      const attempts = user.failedLoginAttempts + 1;
      const updates: any = { failedLoginAttempts: attempts };
      if (attempts >= 5) {
        updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        updates.failedLoginAttempts = 0;
        await logSecurityEvent({ type: "ACCOUNT_LOCKED", ipAddress: "unknown", userId: user.id });
      }
      await prisma.user.update({ where: { id: user.id }, data: updates });
      await logSecurityEvent({ type: "LOGIN_FAILURE", ipAddress: "unknown", userId: user.id, details: { attempts } });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date(), lastLoginIp: request.headers.get("x-forwarded-for") || "unknown" },
    });

    await createSession(user.id, request.headers.get("x-forwarded-for") || "unknown", request.headers.get("user-agent") || undefined);
    await logSecurityEvent({ type: "LOGIN_SUCCESS", ipAddress: "unknown", userId: user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
