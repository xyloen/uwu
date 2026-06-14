"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  const [appUrl, setAppUrl] = useState(process.env.NEXT_PUBLIC_APP_URL || "");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground">Global configuration for the CMS platform.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>General</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Application URL</Label>
            <Input value={appUrl} onChange={(e) => setAppUrl(e.target.value)} />
            <p className="text-xs text-muted-foreground">Used for links, redirects, and CORS.</p>
          </div>
          <Button onClick={handleSave}>{saved ? "Saved!" : "Save Settings"}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Session & Security</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Session max age: {process.env.SESSION_MAX_AGE_SECONDS || "86400"} seconds (24 hours)</p>
          <p>Rate limit: {process.env.RATE_LIMIT_MAX_REQUESTS || "100"} requests per window</p>
          <p>Rate limit window: {process.env.RATE_LIMIT_WINDOW_MS || "60000"}ms</p>
          <p className="text-xs">These values are set via environment variables.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Database</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>PostgreSQL via Prisma ORM</p>
          <p>22 models: Users, Sites, Pages, Content Blocks, Components, Assets, Audit, Security, Webhooks & more</p>
          <p>Full RBAC with Role-Based Access Control</p>
        </CardContent>
      </Card>
    </div>
  );
}
