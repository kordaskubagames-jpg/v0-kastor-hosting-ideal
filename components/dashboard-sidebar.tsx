"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Code2, LayoutGrid, Layers, KeyRound, BarChart3, Shield, Settings, LogOut } from "lucide-react"

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/projects", label: "Projects", icon: Layers },
  { href: "/dashboard/keys", label: "Keys", icon: KeyRound },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
]

const adminNav = [
  { href: "/dashboard/admin", label: "Admin Panel", icon: Shield },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function DashboardSidebar({ name, email }: { name: string; email: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const signOut = async () => {
    await fetch("/api/logout", { method: "POST" })
    localStorage.removeItem("userNickname")
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Code2 className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-semibold">LuaForge</span>
      </div>

      <p className="px-5 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Main</p>
      <nav className="flex flex-col gap-1 px-3">
        {nav.map((item) => {
          const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <p className="px-5 pb-2 pt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Admin</p>
      <nav className="flex flex-col gap-1 px-3">
        {adminNav.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-semibold uppercase">
            {name.slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="mt-1 w-full justify-start text-muted-foreground" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
