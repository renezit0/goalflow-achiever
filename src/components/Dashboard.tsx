import { MetricCard } from "./MetricCard";
import { PeriodSelector } from "./PeriodSelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { usePeriodContext } from "@/contexts/PeriodContext";
import { Navigate } from "react-router-dom";

function DashboardContent() {
  const { user, loading: authLoading } = useAuth();
  const { selectedPeriod } = usePeriodContext();
  const { metrics, loading } = useDashboardData(user, selectedPeriod);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <i className="fas fa-spinner fa-spin text-2xl text-primary"></i>
            <span className="text-lg font-medium text-foreground">Carregando...</span>
          </div>
          <p className="text-muted-foreground">Aguarde enquanto carregamos seus dados</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-background via-muted/5 to-accent/5 min-h-screen">
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-black to-yellow-500 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <i className="fas fa-crown text-2xl text-yellow-300"></i>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Olá, {user.nome}!</h1>
                  <p className="text-white/80">Loja {user.loja_id} • {user.tipo?.toUpperCase()}</p>
                </div>
              </div>
              <p className="text-lg text-white/90 max-w-lg">
                Acompanhe suas metas, vendas e performance em tempo real
                {selectedPeriod && (
                  <span className="block text-sm text-white/70 mt-1">
                    Período: {selectedPeriod.label}
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <PeriodSelector />
              <Button variant="secondary" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20">
                <i className="fas fa-chart-line mr-2"></i>
                Relatórios
              </Button>
              <Button variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                <i className="fas fa-trophy mr-2"></i>
                Premiações
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-yellow-500/20 rounded-full blur-2xl"></div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: "fas fa-users", label: "Colaboradores", color: "bg-blue-500", count: "12" },
          { icon: "fas fa-shopping-cart", label: "Vendas Hoje", color: "bg-green-500", count: "8" },
          { icon: "fas fa-bullseye", label: "Metas Ativas", color: "bg-orange-500", count: "5" },
          { icon: "fas fa-trophy", label: "Conquistas", color: "bg-purple-500", count: "3" }
        ].map((item, index) => (
          <div key={index} className="group relative overflow-hidden rounded-xl bg-card border border-border p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center text-white shadow-lg`}>
                <i className={`${item.icon} text-lg`}></i>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">{item.count}</div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ))}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="relative">
                <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
                <div className="absolute inset-0 animate-ping">
                  <i className="fas fa-circle text-primary/20 text-4xl"></i>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Carregando dados...</h3>
                <p className="text-muted-foreground">Aguarde enquanto buscamos suas métricas</p>
              </div>
            </div>
          </div>
        ) : (
          metrics.map((metric, index) => (
            <div key={index} className="group">
              <MetricCard
                title={metric.title}
                value={metric.value}
                target={metric.target}
                missing={metric.missing}
                category={metric.category}
                status={metric.status}
                className="h-full transition-all duration-300 hover:scale-105"
              />
            </div>
          ))
        )}
      </div>

      {/* Enhanced Performance Summary */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Revenue Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/5 via-transparent to-yellow-500/10"></div>
          <div className="relative p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-black rounded-2xl flex items-center justify-center shadow-lg">
                <i className="fas fa-coins text-2xl text-yellow-300"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Comissões Totais</h3>
                <p className="text-muted-foreground">Performance atual</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-yellow-500 bg-clip-text text-transparent mb-2">
                  R$ 1.252,28
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <i className="fas fa-trending-up text-green-500"></i>
                  <span>40% no período</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso da meta</span>
                  <span className="font-semibold text-foreground">40%</span>
                </div>
                <div className="progress-modern">
                  <div 
                    className="progress-fill bg-gradient-to-r from-gray-900 to-yellow-500" 
                    style={{ width: '40%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="space-y-4">
          <div className="rounded-xl bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-200 p-6 group hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white">
                <i className="fas fa-check-circle text-lg"></i>
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-green-700">R$ 500,00</div>
                <div className="text-sm text-green-600">Conquistado</div>
              </div>
              <i className="fas fa-arrow-trend-up text-green-500 text-xl group-hover:scale-110 transition-transform"></i>
            </div>
          </div>
          
          <div className="rounded-xl bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-200 p-6 group hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                <i className="fas fa-clock text-lg"></i>
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-orange-700">R$ 752,28</div>
                <div className="text-sm text-orange-600">Pendente</div>
              </div>
              <i className="fas fa-hourglass-half text-orange-500 text-xl group-hover:scale-110 transition-transform"></i>
            </div>
          </div>
          
          <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-200 p-6 group hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                <i className="fas fa-users text-lg"></i>
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-blue-700">4/10</div>
                <div className="text-sm text-blue-600">Colaboradores ativos</div>
              </div>
              <i className="fas fa-user-friends text-blue-500 text-xl group-hover:scale-110 transition-transform"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  return <DashboardContent />;
}