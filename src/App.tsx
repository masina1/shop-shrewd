import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AdminLayout } from "./components/admin/AdminLayout";
import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";
import ProductPage from "./pages/ProductPage";
import CombosPage from "./pages/CombosPage";
import ComboDetail from "./pages/ComboDetail";
import WishlistsPage from "./pages/WishlistsPage";
import WishlistDetail from "./pages/WishlistDetail";
import AboutPage from "./pages/AboutPage";
import AppPromoPage from "./pages/AppPromoPage";
import Dashboard from "./pages/Dashboard";
import AuthLogin from "./pages/auth/AuthLogin";
import AuthRegister from "./pages/auth/AuthRegister";
import NotFound from "./pages/NotFound";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminStores from "./pages/admin/AdminStores";
import AdminOffers from "./pages/admin/AdminOffers";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth routes without layout */}
          <Route path="/auth/login" element={<AuthLogin />} />
          <Route path="/auth/register" element={<AuthRegister />} />
          
          {/* Admin routes with admin layout */}
          <Route path="/admin/*" element={
            <AdminLayout>
              <Routes>
                <Route path="/" element={<AdminOverview />} />
                <Route path="/products" element={<AdminProducts />} />
                <Route path="/products/new" element={<AdminProductForm />} />
                <Route path="/products/:id" element={<AdminProductForm />} />
                <Route path="/stores" element={<AdminStores />} />
                <Route path="/offers" element={<AdminOffers />} />
                <Route path="/combos" element={<div className="p-6">Combos Admin - Coming Soon</div>} />
                <Route path="/templates" element={<div className="p-6">Templates Admin - Coming Soon</div>} />
                <Route path="/ingestion" element={<div className="p-6">Ingestion Admin - Coming Soon</div>} />
                <Route path="/moderation" element={<div className="p-6">Moderation Admin - Coming Soon</div>} />
                <Route path="/users" element={<div className="p-6">Users Admin - Coming Soon</div>} />
                <Route path="/settings" element={<AdminSettings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AdminLayout>
          } />
          
          {/* Main app routes with layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/combos" element={<CombosPage />} />
                <Route path="/combos/:id" element={<ComboDetail />} />
                <Route path="/lists" element={<WishlistsPage />} />
                <Route path="/lists/:id" element={<WishlistDetail />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/app" element={<AppPromoPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
