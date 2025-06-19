"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Extract breadcrumb paths from URL
  const paths = pathname.split('/').filter(Boolean)

  // Format path segments for display
  const formatPathName = (path: string): string => {
    // Special case for root path
    if (path === "app") return "Dashboard"

    // Capitalize first letter and replace hyphens with spaces
    return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {paths.length > 0 && paths[0] === "app" && (
                <>
                  {paths.length > 1 && (
                    <>
                      {paths.slice(1, -1).map((path, index) => (
                        <React.Fragment key={path}>
                          <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href={`/${paths.slice(0, index + 2).join('/')}`}>
                              {formatPathName(path)}
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                          <BreadcrumbSeparator className="hidden md:block" />
                        </React.Fragment>
                      ))}
                      <BreadcrumbItem>
                        <BreadcrumbPage>
                          {formatPathName(paths[paths.length - 1])}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                  {paths.length === 1 && (
                    <BreadcrumbItem>
                      <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                  )}
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
