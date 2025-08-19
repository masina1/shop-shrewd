import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";
import ProductPage from "./pages/ProductPage";
import CombosPage from "./pages/CombosPage";
import ComboDetail from "./pages/ComboDetail";
import WishlistsPage from "./pages/WishlistsPage";
import WishlistDetail from "./pages/WishlistDetail";
import AboutPage from "./pages/AboutPage";
import AppPromoPage from "./pages/AppPromoPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
