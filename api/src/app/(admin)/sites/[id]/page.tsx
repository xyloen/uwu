"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, FileText, Settings, Palette } from "lucide-react";
import Link from "next/link";

interface SiteDetail {
  id: string; name: string; slug: string; domain: string | null; description: string | null;
  status: string; createdAt: string;
  pages: { id: string; title: string; slug: string; status: string; updatedAt: string }[];
  _count: { assets: number; contentBlocks: number };
}

export default function SiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [site, setSite] = useState<SiteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");

  async function loadSite() {
    const res = await fetch(`/api/sites/${params.id}`);
    if (res.ok) setSite(await res.json());
    else setSite(null);
    setLoading(false);
  }

  useEffect(() => { loadSite(); }, [params.id]);

  async function createPage(e: React.FormEvent) {
    e.preventDefault();
    if (!site) return;
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId: site.id, title: newPageTitle, slug: newPageSlug }),
    });
    if (res.ok) {
      setNewPageTitle(""); setNewPageSlug("");
      loadSite();
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading site...</p>;
  if (!site) return <p className="text-destructive">Site not found.</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/sites")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{site.name}</h1>
          <p className="text-muted-foreground">/{site.slug} {site.domain && `• ${site.domain}`}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">{site.pages.length} Pages</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{site._count.contentBlocks} blocks</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Status</CardTitle></CardHeader>
          <CardContent><p className={`text-2xl font-bold ${site.status === "ACTIVE" ? "text-green-500" : "text-yellow-500"}`}>{site.status}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Assets</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{site._count.assets}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pages</CardTitle>
          <div className="flex gap-2">
            <Link href={`/sites/${site.id}?tab=settings`}>
              <Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-1" /> Settings</Button>
            </Link>
            <Link href={`/sites/${site.id}?tab=theme`}>
              <Button variant="outline" size="sm"><Palette className="h-4 w-4 mr-1" /> Theme</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={createPage} className="flex gap-2 mb-4">
            <Input placeholder="Page title" value={newPageTitle} onChange={(e) => setNewPageTitle(e.target.value)} required />
            <Input placeholder="page-slug" value={newPageSlug} onChange={(e) => setNewPageSlug(e.target.value)} required />
            <Button type="submit" size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </form>
          {site.pages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pages yet.</p>
          ) : (
            <div className="space-y-2">
              {site.pages.map((page) => (
                <Link key={page.id} href={`/sites/${site.id}/pages/${page.id}`} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{page.title}</p>
                      <p className="text-xs text-muted-foreground">/{page.slug}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${page.status === "PUBLISHED" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>{page.status}</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
