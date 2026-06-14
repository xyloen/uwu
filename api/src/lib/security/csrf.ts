import { cookies, headers } from "next/headers";
import { generateCSRFToken } from "../auth/tokens";

const CSRF_COOKIE_NAME = "nexus_csrf";
const CSRF_HEADER_NAME = "x-csrf-token";

export async function createCSRFToken(): Promise<string> {
  const token = generateCSRFToken();
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  return token;
}

export async function verifyCSRFToken(): Promise<boolean> {
  const headersList = await headers();
  const cookieStore = await cookies();
  
  const headerToken = headersList.get(CSRF_HEADER_NAME);
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!headerToken || !cookieToken) return false;
  return headerToken === cookieToken;
}
