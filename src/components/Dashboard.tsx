import { MetricCard } from "./MetricCard";
import { PeriodSelector } from "./PeriodSelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { usePeriodContext } from "@/contexts/PeriodContext";
import { Navigate } from "react-router-dom";
import { getDescricaoTipoUsuario } from "@/utils/userTypes";

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
      {/* Clean Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-border p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Olá, {user.nome}!</h1>
              <p className="text-muted-foreground">Loja {user.loja_id} • {getDescricaoTipoUsuario(user.tipo || '')}</p>
            </div>
            <p className="text-lg text-muted-foreground max-w-lg">
              Acompanhe suas metas, vendas e performance em tempo real
              {selectedPeriod && (
                <span className="block text-sm text-muted-foreground/70 mt-1">
                  Período: {selectedPeriod.label}
                </span>
              )}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <PeriodSelector />
            <Button variant="outline" className="border-border hover:bg-muted">
              <i className="fas fa-chart-line mr-2"></i>
              Relatórios
            </Button>
            <Button variant="default" className="bg-primary hover:bg-primary/90">
              <i className="fas fa-trophy mr-2"></i>
              Premiações
            </Button>
          </div>
        </div>
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
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-sm hover:shadow-xl transition-all duration-500">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="fas fa-coins text-2xl text-white"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900">Comissões Totais</h3>
                <p className="text-blue-700">Performance atual</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                  R$ 1.252,28
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <i className="fas fa-trending-up text-green-500"></i>
                  <span>40% no período</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Progresso da meta</span>
                  <span className="font-semibold text-blue-900">40%</span>
                </div>
                <div className="progress-modern">
                  <div 
                    className="progress-fill bg-gradient-to-r from-blue-500 to-blue-600" 
                    style={{ width: '40%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="space-y-4">
          <div className="rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-green-200 p-6 group hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white">
                <i className="fas fa-check-circle text-lg"></i>
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-green-800">R$ 500,00</div>
                <div className="text-sm text-green-700">Conquistado</div>
              </div>
              <i className="fas fa-arrow-trend-up text-green-500 text-xl group-hover:scale-110 transition-transform"></i>
            </div>
          </div>
          
          <div className="rounded-xl bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 p-6 group hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                <i className="fas fa-clock text-lg"></i>
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-orange-800">R$ 752,28</div>
                <div className="text-sm text-orange-700">Pendente</div>
              </div>
              <i className="fas fa-hourglass-half text-orange-500 text-xl group-hover:scale-110 transition-transform"></i>
            </div>
          </div>
          
          <div className="rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-6 group hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                <i className="fas fa-users text-lg"></i>
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-blue-800">4/10</div>
                <div className="text-sm text-blue-700">Colaboradores ativos</div>
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