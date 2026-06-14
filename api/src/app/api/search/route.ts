import { NextResponse } from "next/server";
import { GlobalSearch } from "@/lib/cms/global-search";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const siteId = url.searchParams.get("siteId") || undefined;
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const results = await GlobalSearch.search(q, siteId, limit);
  return NextResponse.json(results);
}
