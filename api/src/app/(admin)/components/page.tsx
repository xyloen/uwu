"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Component, Globe } from "lucide-react";

interface ComponentDef {
  id: string; type: string; label: string; category: string; isGlobal: boolean;
  currentVersion: number; createdAt: string; _count: { blocks: number };
}

export default function ComponentsPage() {
  const [components, setComponents] = useState<ComponentDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("");
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState("general");
  const [isGlobal, setIsGlobal] = useState(false);

  async function loadComponents() {
    const res = await fetch("/api/components");
    if (res.ok) setComponents(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadComponents(); }, []);

  async function createComponent(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/components", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, label, category, isGlobal, schema: {}, defaultData: {} }),
    });
    if (res.ok) {
      setShowForm(false); setType(""); setLabel("");
      loadComponents();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Components</h1>
          <p className="text-muted-foreground">Reusable component definitions for the page builder.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" /> New Component</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Create Component Definition</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={createComponent} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Type (identifier)</Label>
                  <Input id="type" value={type} onChange={(e) => setType(e.target.value)} required placeholder="hero-section" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} required placeholder="Hero Section" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>
                <div className="space-y-2 flex items-end">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={isGlobal} onChange={(e) => setIsGlobal(e.target.checked)} />
                    Global (available to all sites)
                  </label>
                </div>
              </div>
              <Button type="submit">Create Component</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading components...</p>
      ) : components.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Component className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No components yet</p>
            <p className="text-sm text-muted-foreground">Create reusable components for your sites.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {components.map((comp) => (
            <Card key={comp.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Component className="h-4 w-4" />
                  {comp.label}
                  {comp.isGlobal && <Globe className="h-3 w-3 text-muted-foreground" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Type: {comp.type}</p>
                <p className="text-xs text-muted-foreground">Category: {comp.category}</p>
                <p className="text-xs text-muted-foreground">v{comp.currentVersion} • Used in {comp._count.blocks} blocks</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
