import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Package,
  Store,
  Tag,
  Layers,
  FileText,
  Download,
  Shield,
  Users,
  Settings,
  DollarSign,
  Menu,
  X,
  FolderTree,
  AlertTriangle,
  Activity,
  Search
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminTranslation } from "@/hooks/useTranslation";

const sidebarItems = [
  // Core Overview
  { titleKey: "sidebar.overview", url: "/ori-core", icon: BarChart3 },
  
  // Data Processing Group
  { titleKey: "ingestion", url: "/ori-core/ingestion", icon: Download },
  { titleKey: "categories", url: "/ori-core/categories", icon: FolderTree },
  { titleKey: "unmapped", url: "/ori-core/unmapped", icon: AlertTriangle },
  { titleKey: "processing", url: "/ori-core/processing", icon: Activity },
  { titleKey: "search-indices", url: "/ori-core/search-indices", icon: Search },
  
  // Content Management Group
  { titleKey: "sidebar.products", url: "/ori-core/products", icon: Package },
  { titleKey: "sidebar.stores", url: "/ori-core/stores", icon: Store },
  { titleKey: "sidebar.offers", url: "/ori-core/offers", icon: Tag },
  { titleKey: "combos", url: "/ori-core/combos", icon: Layers },
  { titleKey: "templates", url: "/ori-core/templates", icon: FileText },
  
  // Quality & Review Group
  { titleKey: "sidebar.review", url: "/ori-core/review", icon: Shield },
  { titleKey: "moderation", url: "/ori-core/moderation", icon: Shield },
  
  // Administration Group
  { titleKey: "users", url: "/ori-core/users", icon: Users },
  { titleKey: "monetization", url: "/ori-core/monetization", icon: DollarSign },
  { titleKey: "sidebar.settings", url: "/ori-core/settings", icon: Settings },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useAdminTranslation();

  const isActive = (path: string) => {
    if (path === "/ori-core") {
      return currentPath === "/ori-core";
    }
    return currentPath.startsWith(path);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-200 ease-in-out",
          // Mobile: fixed overlay
          "fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto",
          // Show/hide on mobile
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        role="navigation"
        aria-label="Admin navigation"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
            <h2 className="text-lg font-semibold text-sidebar-foreground">
              ORI Core Panel
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-2" role="list">
              {sidebarItems.map((item, index) => {
                const active = isActive(item.url);
                const showSeparator = index === 1 || index === 5 || index === 10 || index === 12;
                
                return (
                  <li key={item.titleKey}>
                    {showSeparator && (
                      <div className="my-4">
                        <div className="h-px bg-sidebar-border" />
                      </div>
                    )}
                    <NavLink
                      to={item.url}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      <span>{t(item.titleKey)}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}