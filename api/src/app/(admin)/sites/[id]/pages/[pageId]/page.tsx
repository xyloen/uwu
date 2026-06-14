"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Eye, History, RotateCcw, Plus, Trash2, GripVertical } from "lucide-react";

interface ContentBlock {
  id: string; componentType: string; data: any; order: number; visible: boolean;
  styleOptions: any;
}

interface PageDetail {
  id: string; title: string; slug: string; status: string; description: string | null;
  seoTitle: string | null; seoDescription: string | null; metadata: any;
  contentBlocks: ContentBlock[];
  contentVersions: { id: string; version: number; changeNote: string | null; createdAt: string }[];
  site: { id: string; name: string };
}

export default function PageEditorPage() {
  const params = useParams();
  const router = useRouter();
  const [page, setPage] = useState<PageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const loadPage = useCallback(async () => {
    const res = await fetch(`/api/pages/${params.pageId}`);
    if (res.ok) {
      const data = await res.json();
      setPage(data);
      setBlocks(data.contentBlocks || []);
    }
    setLoading(false);
  }, [params.pageId]);

  useEffect(() => { loadPage(); }, [loadPage]);

  async function saveBlocks() {
    setSaving(true);
    const res = await fetch(`/api/sites/${params.id}/pages/${params.pageId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "blocks", blocks }),
    });
    if (res.ok) setLastSaved(new Date());
    setSaving(false);
  }

  async function publishPage() {
    setSaving(true);
    await fetch(`/api/sites/${params.id}/pages/${params.pageId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish", userId: "system" }),
    });
    loadPage();
    setSaving(false);
  }

  function addBlock() {
    setBlocks([...blocks, {
      id: crypto.randomUUID(), componentType: "richtext", data: { content: "" },
      order: blocks.length, visible: true, styleOptions: {},
    }]);
  }

  function updateBlock(id: string, data: any) {
    setBlocks(blocks.map(b => b.id === id ? { ...b, data } : b));
  }

  function removeBlock(id: string) {
    setBlocks(blocks.filter(b => b.id !== id));
  }

  if (loading) return <p className="text-muted-foreground">Loading page editor...</p>;
  if (!page) return <p className="text-destructive">Page not found.</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/sites/${params.id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{page.title}</h1>
            <p className="text-sm text-muted-foreground">{page.site.name} / {page.slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {lastSaved && <span className="text-xs text-muted-foreground self-center">Saved {lastSaved.toLocaleTimeString()}</span>}
          <Button variant="outline" size="sm" onClick={saveBlocks} disabled={saving}>
            <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
          </Button>
          <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" /> Preview</Button>
          <Button variant="outline" size="sm"><History className="h-4 w-4 mr-1" /> History</Button>
          {page.status !== "PUBLISHED" && (
            <Button size="sm" onClick={publishPage}><RotateCcw className="h-4 w-4 mr-1" /> Publish</Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>SEO & Meta</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>SEO Title</Label>
            <Input defaultValue={page.seoTitle || ""} placeholder="Meta title" />
          </div>
          <div className="space-y-2">
            <Label>SEO Description</Label>
            <Input defaultValue={page.seoDescription || ""} placeholder="Meta description" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Content Blocks ({blocks.length})</CardTitle>
          <Button size="sm" onClick={addBlock}><Plus className="h-4 w-4 mr-1" /> Add Block</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {blocks.length === 0 && <p className="text-sm text-muted-foreground">No content blocks yet.</p>}
          {blocks.map((block, i) => (
            <div key={block.id} className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-3">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <span className="text-xs font-medium text-muted-foreground uppercase">{block.componentType} #{i + 1}</span>
                <div className="flex-1" />
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeBlock(block.id)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
              <textarea
                className="w-full min-h-[100px] rounded-md border bg-background p-3 text-sm"
                value={typeof block.data?.content === "string" ? block.data.content : JSON.stringify(block.data, null, 2)}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                placeholder="Enter content..."
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {page.contentVersions.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Version History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {page.contentVersions.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded border p-2 text-sm">
                  <span>v{v.version} — {v.changeNote || "No note"}</span>
                  <span className="text-xs text-muted-foreground">{new Date(v.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
