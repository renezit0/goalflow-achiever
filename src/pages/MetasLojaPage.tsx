import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePeriodoAtual } from "@/hooks/usePeriodoAtual";
import { PeriodSelector } from "@/components/PeriodSelector";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, useNavigate } from "react-router-dom";

interface MetaCategoria {
  categoria: string;
  nome: string;
  meta: number;
  realizado: number;
  progresso: number;
  restante: number;
  metaDiaria: number;
  mediaRealizada: number;
  icon: string;
  color: string;
}

export default function MetasLojaPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const periodo = usePeriodoAtual();
  const [metas, setMetas] = useState<MetaCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodoInfo, setPeriodoInfo] = useState<any>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (user && periodo) {
      fetchMetas();
    }
  }, [user, periodo]);

  const fetchMetas = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Buscar período atual
      const { data: periodos, error: periodosError } = await supabase
        .from('periodos_meta')
        .select('*')
        .lte('data_inicio', periodo.dataFim.toISOString().split('T')[0])
        .gte('data_fim', periodo.dataInicio.toISOString().split('T')[0])
        .eq('status', 'ativo')
        .limit(1);

      if (periodosError) {
        console.error('Erro ao buscar períodos:', periodosError);
        setLoading(false);
        return;
      }

      if (!periodos || periodos.length === 0) {
        console.log('Período atual não encontrado');
        setLoading(false);
        return;
      }

      const periodoAtual = periodos[0];
      setPeriodoInfo(periodoAtual);

      // Buscar metas da loja atual
      const { data: metasLoja } = await supabase
        .from('metas_loja')
        .select('*, metas_loja_categorias(*)')
        .eq('loja_id', user.loja_id)
        .eq('periodo_meta_id', periodoAtual.id);

      // Buscar vendas da loja atual no período correto
      const { data: vendasLoja } = await supabase
        .from('vendas_loja')
        .select('*')
        .eq('loja_id', user.loja_id)
        .gte('data_venda', periodoAtual.data_inicio)
        .lte('data_venda', periodoAtual.data_fim);

      // Categorias de metas
      const categorias = [
        { id: 'geral', name: 'Meta Geral', icon: '📊', color: 'bg-info' },
        { id: 'r_mais', name: 'Rentáveis', icon: '📈', color: 'bg-category-rentavel' },
        { id: 'perfumaria_r_mais', name: 'Perfumaria R+', icon: '🌸', color: 'bg-category-perfumaria' },
        { id: 'conveniencia_r_mais', name: 'Conveniência R+', icon: '🏪', color: 'bg-category-conveniencia' },
        { id: 'saude', name: 'GoodLife', icon: '💚', color: 'bg-category-goodlife' }
      ];

      const processedMetas: MetaCategoria[] = [];

      for (const categoria of categorias) {
        // Buscar meta da categoria
        let metaValor = 0;
        
        if (categoria.id === 'geral') {
          // Para categoria geral, usar meta_valor_total da metas_loja
          metaValor = metasLoja?.[0]?.meta_valor_total || 0;
        } else {
          // Para outras categorias, buscar na metas_loja_categorias
          const metaCategoria = metasLoja?.[0]?.metas_loja_categorias?.find(
            (m: any) => m.categoria === categoria.id
          );
          metaValor = metaCategoria?.meta_valor || 0;
        }

        // Somar vendas da categoria
        const vendasCategoria = vendasLoja?.filter(
          (v: any) => v.categoria === categoria.id
        ) || [];
        
        const totalVendido = vendasCategoria.reduce((sum: number, v: any) => sum + Number(v.valor_venda), 0);
        const progresso = metaValor > 0 ? (totalVendido / metaValor) * 100 : 0;
        const restante = Math.max(0, metaValor - totalVendido);
        
        // Calcular dias no período
        const diasPeriodo = Math.ceil((periodo.dataFim.getTime() - periodo.dataInicio.getTime()) / (1000 * 60 * 60 * 24));
        const diasDecorridos = Math.ceil((new Date().getTime() - periodo.dataInicio.getTime()) / (1000 * 60 * 60 * 24));
        const metaDiaria = metaValor / diasPeriodo;
        const mediaRealizada = diasDecorridos > 0 ? totalVendido / diasDecorridos : 0;

        processedMetas.push({
          categoria: categoria.id,
          nome: categoria.name,
          meta: metaValor,
          realizado: totalVendido,
          progresso: Math.min(progresso, 100),
          restante,
          metaDiaria,
          mediaRealizada,
          icon: categoria.icon,
          color: categoria.color
        });
      }

      setMetas(processedMetas);
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container flex min-h-screen w-full bg-background">
      {/* Sidebar - Desktop */}
      <DashboardSidebar className="hidden lg:flex" />
      
      {/* Main Content */}
      <div className="content flex-1 lg:ml-[70px] transition-all duration-300">
        {/* Top Header */}
        <header className="header sticky top-0 z-40 bg-card border-b border-border shadow-sm animate-slide-up">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="header-left flex items-center gap-4">
              <MobileSidebar />
              <div>
                <h1 className="page-title text-xl font-semibold text-foreground flex items-center gap-2">
                  <i className="fas fa-bullseye text-primary"></i>
                  Metas da Loja {user.loja_id}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Acompanhe o desempenho das metas por categoria
                </p>
              </div>
            </div>
            
            <div className="header-right flex items-center gap-3">
              <PeriodSelector />
              
              <div className="id-badge flex flex-col items-end bg-muted/50 px-3 py-2 rounded-lg">
                <div className="id-badge-label text-xs text-muted-foreground">
                  Período
                </div>
                <div className="id-badge-value text-sm font-semibold text-foreground">
                  {new Date().toLocaleDateString('pt-BR')}
                </div>
                <div className="id-badge-role text-xs text-muted-foreground">
                  Status: Ativo
                </div>
              </div>

              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="btn-modern text-destructive hover:text-destructive border-destructive/20 hover:border-destructive"
              >
                <i className="fas fa-sign-out-alt text-sm mr-2"></i>
                Sair
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="content-area p-6 min-h-[calc(100vh-80px)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <i className="fas fa-spinner fa-spin text-xl text-primary"></i>
                <span className="text-lg font-medium text-foreground">Carregando metas...</span>
              </div>
              <p className="text-muted-foreground">Buscando dados das metas por categoria</p>
            </div>
          ) : (
            <>
              {/* Status do Período */}
              <div className="mb-8 animate-slide-in-right">
                <div className="card-modern p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                        <i className="fas fa-chart-line text-lg text-warning"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Status do Período</h3>
                        <p className="text-sm text-muted-foreground">Progresso geral das metas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="badge-modern badge-warning mb-2">
                        <i className="fas fa-clock text-xs mr-1"></i>
                        Em Andamento
                      </Badge>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          <i className="fas fa-hourglass-half text-xs mr-1"></i>
                          Tempo: 29.6% decorrido
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <i className="fas fa-calendar text-xs mr-1"></i>
                          {new Date().toLocaleDateString('pt-BR')} 23:40:09
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalhes por Categoria */}
              <div className="mb-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-layer-group text-lg text-primary"></i>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Detalhes por Categoria
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Acompanhe o desempenho de cada categoria individualmente
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {metas.map((meta, index) => (
                    <Card key={index} className="card-modern animate-scale-in hover:shadow-lg">
                      <CardHeader className="card-header-modern pb-3">
                        <CardTitle className="flex items-center justify-between text-base">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-muted/50 rounded-lg flex items-center justify-center">
                              <i className={`${meta.icon} text-sm text-primary`}></i>
                            </div>
                            <span className="font-semibold">{meta.nome}</span>
                          </div>
                          {meta.categoria === 'geral' && (
                            <Badge className="badge-modern badge-info text-xs">
                              <i className="fas fa-clock text-xs mr-1"></i>
                              Hoje
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="card-body-modern space-y-4">
                        {meta.meta === 0 ? (
                          <div className="text-center py-6">
                            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-3">
                              <i className="fas fa-exclamation-triangle text-2xl text-muted-foreground"></i>
                            </div>
                            <p className="text-muted-foreground text-sm mb-2">
                              {meta.categoria === 'geral' 
                                ? "Dados de Self Checkout não disponíveis para esta data." 
                                : "Meta não definida para esta categoria."
                              }
                            </p>
                            {meta.categoria === 'geral' && (
                              <p className="text-xs text-muted-foreground">
                                O módulo Self Checkout está disponível em "Self Checkout" no menu.
                              </p>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center p-2 bg-muted/20 rounded-lg">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                  <i className="fas fa-bullseye text-xs"></i>
                                  Meta:
                                </span>
                                <span className="font-semibold text-foreground">{formatCurrency(meta.meta)}</span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-primary/5 rounded-lg">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                  <i className="fas fa-chart-bar text-xs"></i>
                                  Realizado:
                                </span>
                                <span className="font-semibold text-primary">{formatCurrency(meta.realizado)}</span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                  <i className="fas fa-percentage text-xs"></i>
                                  Progresso:
                                </span>
                                <span className="font-semibold">{meta.progresso.toFixed(1)}%</span>
                              </div>
                              <div className="progress-modern">
                                <div 
                                  className={`progress-fill ${
                                    meta.progresso >= 100 ? 'progress-success' : 
                                    meta.progresso >= 70 ? 'progress-info' : 
                                    meta.progresso >= 40 ? 'progress-warning' : 'progress-error'
                                  }`}
                                  style={{ width: `${Math.min(meta.progresso, 100)}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                              <div className="text-center p-2 bg-muted/10 rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">Restante</div>
                                <div className="font-medium text-sm">{formatCurrency(meta.restante)}</div>
                              </div>
                              <div className="text-center p-2 bg-muted/10 rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">Meta Diária</div>
                                <div className="font-medium text-sm">{formatCurrency(meta.metaDiaria)}</div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-2 bg-muted/10 rounded-lg">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <i className="fas fa-calculator text-xs"></i>
                                Média Realizada:
                              </span>
                              <span className="font-medium text-sm flex items-center gap-1">
                                {formatCurrency(meta.mediaRealizada)}/dia
                                {meta.mediaRealizada < meta.metaDiaria && (
                                  <i className="fas fa-exclamation-triangle text-xs text-warning"></i>
                                )}
                              </span>
                            </div>

                            {meta.realizado < meta.meta && (
                              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-warning text-sm">
                                  <i className="fas fa-exclamation-triangle text-sm"></i>
                                  <span className="font-medium">
                                    Faltam {formatCurrency(meta.restante)} para a meta diária
                                  </span>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}