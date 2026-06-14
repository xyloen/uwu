"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, FileText, Video, Music } from "lucide-react";

interface Asset {
  id: string; filename: string; originalName: string; mimeType: string;
  url: string; type: string; size: number; width: number | null; height: number | null;
  alt: string | null; createdAt: string;
}

const typeIcons: Record<string, any> = { IMAGE: ImageIcon, VIDEO: Video, DOCUMENT: FileText, AUDIO: Music };

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/assets").then(r => r.ok ? r.json() : []).then(setAssets).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
        <p className="text-muted-foreground">Media library across all sites. {assets.length} total items.</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading assets...</p>
      ) : assets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No assets yet</p>
            <p className="text-sm text-muted-foreground">Upload images and media through the API.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {assets.map((asset) => {
            const Icon = typeIcons[asset.type] || FileText;
            return (
              <Card key={asset.id}>
                <CardContent className="pt-4">
                  <div className="aspect-video rounded-md bg-muted flex items-center justify-center mb-2">
                    {asset.type === "IMAGE" && asset.url ? (
                      <img src={asset.url} alt={asset.alt || ""} className="h-full w-full object-cover rounded-md" />
                    ) : (
                      <Icon className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">{asset.originalName}</p>
                  <p className="text-xs text-muted-foreground">{asset.type} • {(asset.size / 1024).toFixed(1)} KB</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
