import { useState } from "react";
import { Menu, Search, Plus, ChevronDown, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation, Link } from "react-router-dom";
import { useAdminTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface AdminTopbarProps {
  onMenuClick: () => void;
}

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const { t } = useAdminTranslation();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length === 1 && segments[0] === 'ori-core') {
      return [{ label: t('sidebar.overview'), href: '/ori-core' }];
    }
    
    const breadcrumbs = [{ label: t('sidebar.overview'), href: '/ori-core' }];
    
    if (segments.length > 1) {
      const section = segments[1];
      const sectionLabels: Record<string, string> = {
        products: t('sidebar.products'),
        stores: t('sidebar.stores'),
        offers: t('sidebar.offers'),
        combos: 'Combos',
        templates: 'Templates',
        ingestion: 'Ingestion',
        moderation: 'Moderation',
        users: 'Users',
        settings: t('sidebar.settings')
      };
      
      breadcrumbs.push({
        label: sectionLabels[section] || section,
        href: `/ori-core/${section}`
      });
      
      if (segments.length > 2) {
        const action = segments[2];
        if (action === 'new') {
          breadcrumbs.push({
            label: 'New',
            href: `/admin/${section}/new`
          });
        } else {
          breadcrumbs.push({
            label: `Edit ${action}`,
            href: path
          });
        }
      }
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const handleQuickAdd = (type: string) => {
    const routes: Record<string, string> = {
      product: '/ori-core/products/new',
      store: '/ori-core/stores/new',
      offer: '/ori-core/offers/new',
      combo: '/ori-core/combos/new'
    };
    
    if (routes[type]) {
      window.location.href = routes[type];
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 m-0 p-0">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* App title */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold hidden sm:block">
            ORI Core - Price Comparison
          </h1>
          <h1 className="text-lg font-semibold sm:hidden">
            ORI Core
          </h1>
        </div>

        {/* Breadcrumbs */}
        <div className="hidden md:block">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex-1" />

        {/* Global search */}
        <div className="relative w-64 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('topbar.search_placeholder')}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Quick add button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t('topbar.quick_add')}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleQuickAdd('product')}>
              {t('topbar.add_product')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAdd('store')}>
              {t('topbar.add_store')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAdd('offer')}>
              {t('topbar.add_offer')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAdd('combo')}>
              {t('topbar.add_combo')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              {t('topbar.profile')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              {t('topbar.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}