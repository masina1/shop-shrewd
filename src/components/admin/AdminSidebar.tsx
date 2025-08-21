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
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminTranslation } from "@/hooks/useTranslation";

const sidebarItems = [
  { titleKey: "sidebar.overview", url: "/admin", icon: BarChart3 },
  { titleKey: "sidebar.products", url: "/admin/products", icon: Package },
  { titleKey: "sidebar.stores", url: "/admin/stores", icon: Store },
  { titleKey: "sidebar.offers", url: "/admin/offers", icon: Tag },
  { titleKey: "sidebar.review", url: "/admin/review", icon: Shield },
  { titleKey: "combos", url: "/admin/combos", icon: Layers },
  { titleKey: "templates", url: "/admin/templates", icon: FileText },
  { titleKey: "ingestion", url: "/admin/ingestion", icon: Download },
  { titleKey: "moderation", url: "/admin/moderation", icon: Shield },
  { titleKey: "users", url: "/admin/users", icon: Users },
  { titleKey: "sidebar.settings", url: "/admin/settings", icon: Settings },
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
    if (path === "/admin") {
      return currentPath === "/admin";
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
              {t('sidebar.admin_panel')}
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
              {sidebarItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <li key={item.titleKey}>
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