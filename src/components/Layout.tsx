import { Link, useLocation } from "react-router-dom";
import { Search, User, Menu, Home, Package, Heart, Info, Smartphone, Settings, LogOut, BarChart3, Upload, Award, Trophy } from "lucide-react";
import { useState } from "react";
import { SearchBar } from "./SearchBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNavigationTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useNavigationTranslation();
  
  // Mock authentication state - in real app this would come from auth context
  const [isAuthenticated] = useState(false);
  const [userName] = useState("Ana");

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", labelKey: "main.home", icon: Home },
    { path: "/combos", labelKey: "main.combos", icon: Package },
    { path: "/lists", labelKey: "main.lists", icon: Heart },
    { path: "/about", labelKey: "main.about", icon: Info },
    { path: "/app", labelKey: "main.use_app", icon: Smartphone },
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
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>

          {/* Language Switcher */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden ml-auto p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* User Menu */}
          <div className="hidden md:flex items-center ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isAuthenticated ? (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground">Signed in</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        {t('main.dashboard')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/lists" className="flex items-center">
                        <Heart className="mr-2 h-4 w-4" />
                        {t('main.my_lists')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/submit-offer" className="flex items-center">
                        <Upload className="mr-2 h-4 w-4" />
                        Submit Offer
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/rewards" className="flex items-center">
                        <Award className="mr-2 h-4 w-4" />
                        My Rewards
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/leaderboard" className="flex items-center">
                        <Trophy className="mr-2 h-4 w-4" />
                        Leaderboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        {t('main.settings')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('main.logout')}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/auth/login" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        {t('main.sign_in')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/auth/register" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        {t('main.sign_up')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5">
                      <p className="text-xs text-muted-foreground">
                        Sign in to sync your lists and get alerts
                      </p>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
                    <span>{t(item.labelKey)}</span>
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
                <span className="text-[10px]">{t(item.labelKey)}</span>
              </Link>
            );
          })}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex-1 flex flex-col items-center py-2 px-1 text-xs text-muted-foreground">
                <User className="h-5 w-5 mb-1" />
                <span className="text-[10px]">{t('mobile.profile')}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mb-2">
              {isAuthenticated ? (
                <>
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">Signed in</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      {t('main.dashboard')}
                    </Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                     <Link to="/lists" className="flex items-center">
                       <Heart className="mr-2 h-4 w-4" />
                       {t('main.my_lists')}
                     </Link>
                   </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                     <Link to="/submit-offer" className="flex items-center">
                       <Upload className="mr-2 h-4 w-4" />
                       Submit Offer
                     </Link>
                   </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                     <Link to="/rewards" className="flex items-center">
                       <Award className="mr-2 h-4 w-4" />
                       My Rewards
                     </Link>
                   </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                     <Link to="/leaderboard" className="flex items-center">
                       <Trophy className="mr-2 h-4 w-4" />
                       Leaderboard
                     </Link>
                   </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                     <Link to="/settings" className="flex items-center">
                       <Settings className="mr-2 h-4 w-4" />
                       {t('main.settings')}
                     </Link>
                   </DropdownMenuItem>
                   <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('main.logout')}
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/auth/login" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      {t('main.sign_in')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/auth/register" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      {t('main.sign_up')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5">
                    <p className="text-xs text-muted-foreground">
                      Sign in to sync your lists and get alerts
                    </p>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>

      {/* Bottom padding for mobile nav */}
      <div className="md:hidden h-16" />
    </div>
  );
};