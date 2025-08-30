import { MetricCard } from "./MetricCard";
import { PeriodSelector } from "./PeriodSelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { usePeriodoAtual } from "@/hooks/usePeriodoAtual";
import { Navigate } from "react-router-dom";

export function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { metrics, loading } = useDashboardData(user);
  const periodo = usePeriodoAtual();

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
    <div className="min-h-screen bg-background">
      {/* Content Area */}
      <main className="p-6">
        {/* Action Tabs */}
        <div className="flex flex-wrap gap-3 mb-8 animate-slide-in-right">
          <Button variant="secondary" size="sm" className="btn-modern">
            <i className="fas fa-users text-sm mr-2"></i>
            Colaboradores
          </Button>
          <Button variant="outline" size="sm" className="btn-modern bg-warning/10 text-warning border-warning/20">
            <i className="fas fa-shopping-cart text-sm mr-2"></i>
            Vendas Hoje
          </Button>
          <Button variant="outline" size="sm" className="btn-outline-modern">
            <i className="fas fa-chart-bar text-sm mr-2"></i>
            Vendas Ontem
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <i className="fas fa-spinner fa-spin text-xl text-primary"></i>
                <span className="text-lg font-medium text-foreground">Carregando dados...</span>
              </div>
              <p className="text-muted-foreground">Aguarde enquanto buscamos as métricas</p>
            </div>
          ) : (
            metrics.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                target={metric.target}
                missing={metric.missing}
                category={metric.category}
                status={metric.status}
                className="animate-scale-in"
              />
            ))
          )}
        </div>

        {/* Summary Card */}
        <div className="card-modern animate-slide-up">
          <div className="card-header-modern">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-coins text-lg text-primary"></i>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Resumo das Comissões Totais
                </h2>
                <p className="text-sm text-muted-foreground">
                  Performance do período atual
                </p>
              </div>
            </div>
            <Badge className="badge-modern badge-info">
              <i className="fas fa-users text-xs mr-1"></i>
              4/10 colaboradores
            </Badge>
          </div>
          
          <div className="card-body-modern">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="text-4xl font-bold text-foreground mb-2">
                  R$ 1.252,28
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-percentage text-sm text-success"></i>
                    <span className="text-sm text-muted-foreground">40,0% no prazo</span>
                  </div>
                </div>
                <div className="progress-modern">
                  <div className="progress-fill progress-warning" style={{ width: '40%' }}></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="fas fa-clock text-sm text-warning"></i>
                    <span className="text-sm font-medium text-foreground">Pendente</span>
                  </div>
                  <div className="text-xl font-semibold text-foreground">R$ 752,28</div>
                </div>
                
                <div className="p-4 bg-success/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="fas fa-check-circle text-sm text-success"></i>
                    <span className="text-sm font-medium text-foreground">Conquistado</span>
                  </div>
                  <div className="text-xl font-semibold text-foreground">R$ 500,00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}