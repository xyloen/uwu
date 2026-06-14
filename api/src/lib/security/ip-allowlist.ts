import prisma from "@/lib/prisma";

export async function isIpAllowedForSite(ipAddress: string, siteId: string): Promise<boolean> {
  const allowedIps = await prisma.allowedIp.findMany({
    where: { siteId, isActive: true },
  });

  if (allowedIps.length === 0) return true; // Default to allow if no allowlist configured

  return allowedIps.some((allowed) => {
    return isIpInCidr(ipAddress, allowed.ipAddress);
  });
}

export function isIpInCidr(ip: string, cidr: string): boolean {
  if (!cidr.includes("/")) {
    return ip === cidr;
  }
  
  const [range, bits] = cidr.split("/");
  const mask = ~((1 << (32 - parseInt(bits, 10))) - 1);
  const ipNum = ipToLong(ip);
  const rangeNum = ipToLong(range);

  return (ipNum & mask) === (rangeNum & mask);
}

function ipToLong(ip: string): number {
  return ip.split(".").reduce((ipInt, octet) => (ipInt << 8) + parseInt(octet, 10), 0) >>> 0;
}
