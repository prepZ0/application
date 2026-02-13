"use client"

import { useEffect, useState } from "react"
import { Building2 } from "lucide-react"
import { useActiveOrganization } from "@/lib/auth-client"
import { useAuth } from "@/components/providers/auth-provider"
import { Skeleton } from "@/components/ui/skeleton"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const LS_KEY = "placementhub_org"

export function OrgDisplay() {
  const { session, isLoading } = useAuth()
  const { data: activeOrg } = useActiveOrganization()

  // Local state seeded from localStorage so the name renders instantly
  // on page refresh — no waiting for the Better Auth API round-trip.
  const [cached, setCached] = useState<{ name: string } | null>(null)

  // On mount (client only): read whatever we stored last time
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setCached(JSON.parse(raw))
    } catch {
      /* empty */
    }
  }, [])

  // Whenever fresh data arrives from the org hook, persist it
  useEffect(() => {
    const name = activeOrg?.name
    if (name) {
      const entry = { name }
      setCached(entry)
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(entry))
      } catch {
        /* empty */
      }
    }
  }, [activeOrg?.name])

  const collegeName =
    cached?.name ||
    activeOrg?.name ||
    session?.user?.activeCollegeName ||
    "No Organization"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="cursor-default hover:bg-transparent"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Building2 className="size-4" />
          </div>
          {isLoading ? (
            <div className="grid flex-1 gap-1.5">
              <Skeleton className="h-4 w-28" />
            </div>
          ) : (
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{collegeName}</span>
            </div>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
