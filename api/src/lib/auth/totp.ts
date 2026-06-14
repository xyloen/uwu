import { authenticator } from "otplib/authenticator";
import { randomBytes } from "crypto";
import QRCode from "qrcode";

export function generateTOTPSecret(): {
  secret: string;
  otpauthUrl: string;
} {
  const secret = authenticator.generateSecret();

  const otpauthUrl = authenticator.keyuri(
    "user",
    process.env.TOTP_ISSUER || "NexusCMS",
    secret
  );

  return { secret, otpauthUrl };
}

export function verifyTOTP(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

export function generateRecoveryCodes(count = 8): string[] {
  return Array.from({ length: count }, () => {
    const code = randomBytes(4).toString("hex").toUpperCase();
    return `${code.slice(0, 4)}-${code.slice(4)}`;
  });
}

export async function generateQRCodeDataURL(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl);
}