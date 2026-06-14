"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldAlert } from "lucide-react";

interface SecurityEvent {
  id: string; type: string; ipAddress: string; userAgent: string | null;
  createdAt: string; details: any;
  user: { id: string; name: string; email: string } | null;
}

export default function SecurityPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/security").then(r => r.ok ? r.json() : []).then(setEvents).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Events</h1>
        <p className="text-muted-foreground">Security audit trail. {events.length} events recorded.</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading security events...</p>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No security events</p>
            <p className="text-sm text-muted-foreground">Security events will be logged here.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.user?.name || "Anonymous"}</TableCell>
                    <TableCell><span className="text-xs font-medium">{event.type.replace(/_/g, " ")}</span></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{event.ipAddress}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{JSON.stringify(event.details).slice(0, 50)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleString()}</TableCell>
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
