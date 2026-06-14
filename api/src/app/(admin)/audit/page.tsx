"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity } from "lucide-react";

interface AuditLog {
  id: string; action: string; entityType: string; entityId: string; ipAddress: string;
  createdAt: string; details: any;
  user: { id: string; name: string; email: string } | null;
  site: { id: string; name: string } | null;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit").then(r => r.ok ? r.json() : []).then(setLogs).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">Complete audit trail of all platform actions. {logs.length} events.</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading audit logs...</p>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No audit events yet</p>
            <p className="text-sm text-muted-foreground">Actions will appear here as users interact with the platform.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.user?.name || "System"}</TableCell>
                    <TableCell><span className="text-xs font-medium uppercase">{log.action}</span></TableCell>
                    <TableCell>{log.entityType} / {log.entityId.slice(0, 8)}...</TableCell>
                    <TableCell className="text-muted-foreground">{log.site?.name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{log.ipAddress}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{new Date(log.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
