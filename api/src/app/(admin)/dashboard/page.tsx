import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Globe, Users, ShieldAlert } from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getDashboardStats() {
  const [siteCount, userCount, eventCount, securityCount, recentLogs, totalPages, totalAssets] = await Promise.all([
    prisma.site.count(),
    prisma.user.count(),
    prisma.auditLog.count(),
    prisma.securityEvent.count({ where: { type: { in: ["LOGIN_FAILURE", "UNAUTHORIZED_ACCESS", "IP_BLOCKED"] } } }),
    prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } }, site: { select: { name: true } } },
    }),
    prisma.page.count(),
    prisma.asset.count(),
  ]);
  return { siteCount, userCount, eventCount, securityCount, recentLogs, totalPages, totalAssets };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Dashboard</h1>
        <p className="text-muted-foreground">Real-time overview of all tenants, content, and system health.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.siteCount}</div>
            <p className="text-xs text-muted-foreground">{stats.totalPages} pages across all sites</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userCount}</div>
            <p className="text-xs text-muted-foreground">Registered platform users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.eventCount}</div>
            <p className="text-xs text-muted-foreground">{stats.totalAssets} assets managed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.securityCount}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Audit Logs</CardTitle>
            <CardDescription>Latest editorial and system events across all sites.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentLogs.length === 0 && (
                <p className="text-sm text-muted-foreground">No audit events yet.</p>
              )}
              {stats.recentLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {log.user?.name || "Unknown"} — {log.action.toLowerCase()} {log.entityType}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {log.site?.name ? `Site: ${log.site.name} • ` : ""}
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common platform tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/sites" className="block rounded-lg border p-3 text-sm font-medium hover:bg-muted/50 transition-colors">Manage Sites</a>
            <a href="/components" className="block rounded-lg border p-3 text-sm font-medium hover:bg-muted/50 transition-colors">Manage Components</a>
            <a href="/assets" className="block rounded-lg border p-3 text-sm font-medium hover:bg-muted/50 transition-colors">Upload Assets</a>
            <a href="/users" className="block rounded-lg border p-3 text-sm font-medium hover:bg-muted/50 transition-colors">Manage Users</a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
