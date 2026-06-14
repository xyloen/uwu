"use client";

import { useEffect, useState } from "react";
import { Globe, FileText, Users, Image as ImageIcon, ArrowRight, ExternalLink } from "lucide-react";

interface Site { id: string; name: string; slug: string; status: string; _count: { pages: number; members: number }; }
interface Page { id: string; title: string; slug: string; status: string; _count: { contentBlocks: number }; }

export default function PruebaPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [pages, setPages] = useState<Record<string, Page[]>>({});
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiBase = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "";
    async function load() {
      const res = await fetch(`${apiBase}/api/sites`);
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      setSites(data);
      // Load pages for each site
      const pagesMap: Record<string, Page[]> = {};
      for (const site of data) {
        const pRes = await fetch(`${apiBase}/api/pages?siteId=${site.id}`);
        if (pRes.ok) {
          pagesMap[site.id] = await pRes.json();
        }
      }
      setPages(pagesMap);
      setLoading(false);
    }
    load();
  }, []);

  const filteredSites = selectedSite ? sites.filter(s => s.id === selectedSite) : sites;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-16">
        {/* Hero */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 text-xs text-zinc-400 mb-6">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            CMS API Connected
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white mb-4">
            CMS <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Live Demo</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            This page loads all content from the API in real time. Every site, every page, every block.
            Edit in the admin panel, refresh here, see changes instantly.
          </p>
        </div>

        {/* Stats */}
        {!loading && sites.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3 mb-12">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <p className="text-3xl font-bold text-white">{sites.length}</p>
              <p className="text-sm text-zinc-400 mt-1">Total Sites</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <p className="text-3xl font-bold text-white">{Object.values(pages).flat().length}</p>
              <p className="text-sm text-zinc-400 mt-1">Total Pages</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <p className="text-3xl font-bold text-white">
                {Object.values(pages).flat().reduce((acc, p) => acc + p._count.contentBlocks, 0)}
              </p>
              <p className="text-sm text-zinc-400 mt-1">Content Blocks</p>
            </div>
          </div>
        )}

        {/* Site selector */}
        {sites.length > 0 && (
          <div className="flex gap-2 mb-8 flex-wrap">
            <button onClick={() => setSelectedSite(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!selectedSite ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
              All Sites
            </button>
            {sites.map(s => (
              <button key={s.id} onClick={() => setSelectedSite(s.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedSite === s.id ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                {s.name}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-zinc-600 border-t-white rounded-full mx-auto mb-4" />
            <p className="text-zinc-500">Loading content from API...</p>
          </div>
        )}

        {/* No sites */}
        {!loading && sites.length === 0 && (
          <div className="text-center py-20 rounded-xl border border-dashed border-zinc-800">
            <Globe className="h-12 w-12 mx-auto text-zinc-700 mb-4" />
            <p className="text-zinc-400 text-lg">No sites found</p>
            <p className="text-zinc-600 text-sm mt-1">Create a site in the admin panel first.</p>
          </div>
        )}

        {/* Sites grid */}
        {!loading && filteredSites.map(site => (
          <div key={site.id} className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">{site.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">{site.status}</span>
              </div>
              <a href={`/sites/${site.id}`} className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                Edit in panel <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="text-sm text-zinc-500 mb-4">/{site.slug} — {site._count.pages} pages, {site._count.members} members</p>

            {/* Pages */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {(pages[site.id] || []).length === 0 && (
                <div className="col-span-full text-center py-8 rounded-lg border border-dashed border-zinc-800">
                  <FileText className="h-8 w-8 mx-auto text-zinc-700 mb-2" />
                  <p className="text-zinc-500 text-sm">No pages yet</p>
                </div>
              )}
              {(pages[site.id] || []).map(page => (
                <a key={page.id} href={`/sites/${site.id}/pages/${page.id}`}
                  className="group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <FileText className="h-5 w-5 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                    <span className={`text-xs px-2 py-0.5 rounded-full ${page.status === "PUBLISHED" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>{page.status}</span>
                  </div>
                  <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">{page.title}</h3>
                  <p className="text-xs text-zinc-600 mt-1">/{page.slug} — {page._count.contentBlocks} blocks</p>
                </a>
              ))}
            </div>
          </div>
        ))}

        {/* How it works */}
        {!loading && sites.length > 0 && (
          <div className="mt-16 rounded-xl border border-zinc-800 bg-zinc-900/30 p-8">
            <h3 className="text-lg font-semibold text-white mb-4">How it works</h3>
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-medium">1. Edit in Admin</div>
                <p className="text-zinc-500">Go to the panel, create sites, pages, and edit content blocks. All changes save to PostgreSQL.</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-medium">2. API Serves</div>
                <p className="text-zinc-500">Your frontend calls <code className="text-zinc-300 bg-zinc-800 px-1 rounded">/api/sites</code>, <code className="text-zinc-300 bg-zinc-800 px-1 rounded">/api/pages</code> etc. to get fresh content.</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-400 font-medium">3. Live Display</div>
                <p className="text-zinc-500">Your website renders whatever the API returns. Change content = change site. No redeploy.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
