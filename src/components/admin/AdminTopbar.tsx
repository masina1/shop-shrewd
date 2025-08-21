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

interface AdminTopbarProps {
  onMenuClick: () => void;
}

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length === 1 && segments[0] === 'admin') {
      return [{ label: 'Overview', href: '/admin' }];
    }
    
    const breadcrumbs = [{ label: 'Overview', href: '/admin' }];
    
    if (segments.length > 1) {
      const section = segments[1];
      const sectionLabels: Record<string, string> = {
        products: 'Products',
        stores: 'Stores',
        offers: 'Offers',
        combos: 'Combos',
        templates: 'Templates',
        ingestion: 'Ingestion',
        moderation: 'Moderation',
        users: 'Users',
        settings: 'Settings'
      };
      
      breadcrumbs.push({
        label: sectionLabels[section] || section,
        href: `/admin/${section}`
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
      product: '/admin/products/new',
      store: '/admin/stores/new',
      offer: '/admin/offers/new',
      combo: '/admin/combos/new'
    };
    
    if (routes[type]) {
      window.location.href = routes[type];
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            Price Comparison Admin
          </h1>
          <h1 className="text-lg font-semibold sm:hidden">
            Admin
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
            placeholder="Search products, stores..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Quick add button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleQuickAdd('product')}>
              Add Product
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAdd('store')}>
              Add Store
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAdd('offer')}>
              Add Offer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAdd('combo')}>
              Add Combo
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
              Admin Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}