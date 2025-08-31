import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdsProvider } from "@/contexts/AdsContext";
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
import SubmitOffer from "./pages/SubmitOffer";
import RewardsPage from "./pages/RewardsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import OfferDetail from "./pages/OfferDetail";
import AdminReview from "./pages/admin/AdminReview";
import AdminOfferDetail from "./pages/admin/AdminOfferDetail";
import MonetizationPage from "./pages/admin/MonetizationPage";
import DataIngestion from "./pages/admin/DataIngestion";
import CategoryManagement from "./pages/admin/CategoryManagement";
import UnmappedQueue from "./pages/admin/UnmappedQueue";
import ProcessingStatus from "./pages/admin/ProcessingStatus";
import SearchIndices from "./pages/admin/SearchIndices";
import { DebugPanel } from "./components/DebugPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdsProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          {/* Auth routes without layout */}
          <Route path="/auth/login" element={<AuthLogin />} />
          <Route path="/auth/register" element={<AuthRegister />} />
          
          {/* ORI Core routes with admin layout */}
          <Route path="/ori-core/*" element={
            <AdminLayout>
              <Routes>
                <Route path="/" element={<AdminOverview />} />
                <Route path="/products" element={<AdminProducts />} />
                <Route path="/products/new" element={<AdminProductForm />} />
                <Route path="/products/:id" element={<AdminProductForm />} />
                <Route path="/stores" element={<AdminStores />} />
                <Route path="/offers" element={<AdminOffers />} />
                <Route path="/review" element={<AdminReview />} />
                <Route path="/offers/:id" element={<AdminOfferDetail />} />
                <Route path="/monetization" element={<MonetizationPage />} />
                <Route path="/combos" element={<div className="p-6">Combos Admin - Coming Soon</div>} />
                <Route path="/templates" element={<div className="p-6">Templates Admin - Coming Soon</div>} />
                <Route path="/ingestion" element={<DataIngestion />} />
                <Route path="/categories" element={<CategoryManagement />} />
                <Route path="/unmapped" element={<UnmappedQueue />} />
                <Route path="/processing" element={<ProcessingStatus />} />
                <Route path="/search-indices" element={<SearchIndices />} />
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
                <Route path="/submit-offer" element={<SubmitOffer />} />
                <Route path="/rewards" element={<RewardsPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/offer/:id" element={<OfferDetail />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          } />
        </Routes>
        </BrowserRouter>
        <DebugPanel />
      </AdsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
