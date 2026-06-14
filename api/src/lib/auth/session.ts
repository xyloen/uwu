import { randomBytes, createHash } from "crypto";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

const SESSION_COOKIE_NAME = "nexus_session";
const SESSION_MAX_AGE = parseInt(process.env.SESSION_MAX_AGE_SECONDS || "86400", 10);

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, ipAddress: string, userAgent?: string) {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  const session = await prisma.session.create({
    data: { userId, tokenHash, ipAddress, userAgent, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return { session, token };
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const tokenHash = hashToken(token);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: {
          siteMembers: { include: { role: true, site: true } },
        },
      },
    },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  await prisma.session.update({
    where: { id: session.id },
    data: { lastActiveAt: new Date() },
  });

  return session;
}

export async function rotateSession(currentToken: string) {
  const currentHash = hashToken(currentToken);
  const session = await prisma.session.findUnique({
    where: { tokenHash: currentHash },
  });

  if (!session) return null;

  const newToken = generateSessionToken();
  const newHash = hashToken(newToken);
  const newExpiry = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  await prisma.session.update({
    where: { id: session.id },
    data: { tokenHash: newHash, expiresAt: newExpiry, lastActiveAt: new Date() },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return newToken;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const tokenHash = hashToken(token);
    await prisma.session.deleteMany({ where: { tokenHash } });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function destroyAllUserSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}

export type SessionWithUser = NonNullable<Awaited<ReturnType<typeof getSession>>>;
