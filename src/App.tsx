import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { useUserTheme } from "./hooks/useUserTheme";
import { PeriodProvider } from "./contexts/PeriodContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Vendas from "./pages/Vendas";
import Metas from "./pages/Metas";
import MetasLojaPage from "./pages/MetasLojaPage";
import Campanhas from "./pages/Campanhas";
import Relatorios from "./pages/Relatorios";
import Usuarios from "./pages/Usuarios";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { user } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  
  // Apply user theme
  useUserTheme();

  // Handle sidebar responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarExpanded(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (sidebarExpanded && !target.closest('.sidebar') && !target.closest('.menu-toggle')) {
        setSidebarExpanded(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [sidebarExpanded]);

  return (
    <BrowserRouter>
      <PeriodProvider>
        <div className="flex min-h-screen w-full bg-background">
          {user && (
            <>
              <DashboardSidebar className={`${sidebarExpanded ? 'expanded' : ''}`} />
            {/* Mobile overlay */}
            <div 
              className={`lg:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
                sidebarExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`} 
              onClick={() => setSidebarExpanded(false)} 
            />
            </>
          )}
          
          <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
            user ? 'lg:ml-[70px]' : ''
          }`}>
            {user && (
              <header className="header sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
                <button 
                  className="menu-toggle lg:hidden"
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                >
                  <i className="fas fa-bars"></i>
                </button>
                <div className="flex-1">
                  <h1 className="page-title text-lg font-semibold md:text-xl">Dashboard</h1>
                </div>
              </header>
            )}
            
            <div className="content-area flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/vendas" element={<Vendas />} />
                <Route path="/metas" element={<Metas />} />
                <Route path="/metas-loja" element={<MetasLojaPage />} />
                <Route path="/campanhas" element={<Campanhas />} />
                <Route path="/relatorios" element={<Relatorios />} />
                <Route path="/usuarios" element={<Usuarios />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </main>
        </div>
      </PeriodProvider>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;