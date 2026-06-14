"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { LayoutDashboard, Globe, Component, Image as ImageIcon, Users, Settings, ShieldAlert, Activity, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    }
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) setSearchResults(await res.json());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/sites", icon: Globe, label: "Sites & Tenants" },
    { href: "/components", icon: Component, label: "Components" },
    { href: "/assets", icon: ImageIcon, label: "Assets" },
    { href: "/users", icon: Users, label: "Users & Roles" },
    { href: "/audit", icon: Activity, label: "Audit Logs" },
    { href: "/security", icon: ShieldAlert, label: "Security" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/30">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Globe className="h-6 w-6" />
            <span>NexusCMS</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/30 px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1 relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search (Ctrl+K)..."
                className="w-full bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3 rounded-md border border-input h-9 px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
              />
            </div>
            {searchOpen && searchResults && (
              <div className="absolute top-full mt-1 left-0 right-0 md:w-2/3 lg:w-1/3 bg-popover border rounded-lg shadow-lg z-50 p-2 max-h-80 overflow-y-auto">
                {searchResults.pages?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1">Pages</p>
                    {searchResults.pages.map((p: any) => (
                      <Link key={p.id} href={`/sites/${p.siteId}/pages/${p.id}`} className="block px-2 py-1.5 text-sm rounded hover:bg-muted" onClick={() => setSearchOpen(false)}>{p.title}</Link>
                    ))}
                  </div>
                )}
                {searchResults.sites?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1">Sites</p>
                    {searchResults.sites.map((s: any) => (
                      <Link key={s.id} href={`/sites/${s.id}`} className="block px-2 py-1.5 text-sm rounded hover:bg-muted" onClick={() => setSearchOpen(false)}>{s.name}</Link>
                    ))}
                  </div>
                )}
                {searchResults.components?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1">Components</p>
                    {searchResults.components.map((c: any) => (
                      <Link key={c.id} href="/components" className="block px-2 py-1.5 text-sm rounded hover:bg-muted" onClick={() => setSearchOpen(false)}>{c.label}</Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
