"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Globe, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Site {
  id: string; name: string; slug: string; domain: string | null; status: string;
  createdAt: string; _count: { pages: number; members: number };
}

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadSites() {
    const res = await fetch("/api/sites");
    if (res.ok) setSites(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadSites(); }, []);

  async function createSite(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, description }),
    });
    if (res.ok) {
      setShowForm(false);
      setName(""); setSlug(""); setDescription("");
      loadSites();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sites & Tenants</h1>
          <p className="text-muted-foreground">Manage all multi-tenant sites.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" /> New Site
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Create New Site</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={createSite} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Site Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="my-site" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Site</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading sites...</p>
      ) : sites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No sites yet</p>
            <p className="text-sm text-muted-foreground">Create your first site to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <Link key={site.id} href={`/sites/${site.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {site.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{site.slug}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{site._count.pages} pages</span>
                    <span>{site._count.members} members</span>
                    <span className={`${site.status === "ACTIVE" ? "text-green-500" : "text-yellow-500"}`}>{site.status}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
