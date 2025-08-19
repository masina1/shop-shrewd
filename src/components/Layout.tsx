import { Link, useLocation } from "react-router-dom";
import { Search, User, Menu, Home, Package, Heart, Info, Smartphone } from "lucide-react";
import { useState } from "react";
import { SearchBar } from "./SearchBar";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/combos", label: "Combos", icon: Package },
    { path: "/lists", label: "Lists", icon: Heart },
    { path: "/about", label: "About", icon: Info },
    { path: "/app", label: "Use App", icon: Smartphone },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 mr-4">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">PC</span>
            </div>
            <span className="hidden sm:inline-block font-semibold text-lg">PriceCompare</span>
          </Link>

          {/* Desktop Search - centered */}
          <div className="hidden md:flex flex-1 justify-center max-w-lg mx-4">
            <SearchBar />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`transition-colors hover:text-foreground/80 ${
                  isActive(item.path) ? "text-foreground" : "text-foreground/60"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden ml-auto p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* User/Profile */}
          <div className="hidden md:flex items-center ml-4">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-4">
          <SearchBar />
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="flex flex-col py-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted ${
                      isActive(item.path) ? "text-primary bg-primary/5" : "text-foreground/80"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <nav className="flex">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 flex flex-col items-center py-2 px-1 text-xs transition-colors ${
                  isActive(item.path) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
          <button className="flex-1 flex flex-col items-center py-2 px-1 text-xs text-muted-foreground">
            <User className="h-5 w-5 mb-1" />
            <span className="text-[10px]">Profile</span>
          </button>
        </nav>
      </div>

      {/* Bottom padding for mobile nav */}
      <div className="md:hidden h-16" />
    </div>
  );
};