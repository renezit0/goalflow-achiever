import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePeriodoAtual } from "@/hooks/usePeriodoAtual";
import { PeriodSelector } from "@/components/PeriodSelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { getNomeCategoria, getIconeCategoria, getClasseCorCategoria } from "@/utils/categories";

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
  const { user, loading: authLoading } = useAuth();
  const periodo = usePeriodoAtual();
  const [metas, setMetas] = useState<MetaCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodoInfo, setPeriodoInfo] = useState<any>(null);

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

      // Categorias de metas usando sistema padronizado
      const categorias = [
        { id: 'geral', name: getNomeCategoria('geral') },
        { id: 'r_mais', name: getNomeCategoria('r_mais') },
        { id: 'perfumaria_r_mais', name: getNomeCategoria('perfumaria_r_mais') },
        { id: 'conveniencia_r_mais', name: getNomeCategoria('conveniencia_r_mais') },
        { id: 'saude', name: getNomeCategoria('saude') }
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
          icon: getIconeCategoria(categoria.id),
          color: getClasseCorCategoria(categoria.id)
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
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <i className="fas fa-bullseye text-primary"></i>
            Metas da Loja {user.loja_id}
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o desempenho das metas por categoria
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <PeriodSelector />
          <Button variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <i className="fas fa-download mr-2"></i>
            Exportar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <i className="fas fa-spinner fa-spin text-xl text-primary"></i>
            <span className="text-lg font-medium text-foreground">Carregando metas...</span>
          </div>
          <p className="text-muted-foreground">Buscando dados das metas por categoria</p>
        </div>
      ) : (
        <>
          {/* Status do Período */}
          <div className="mb-8">
            <Card className="card-modern">
              <CardHeader className="card-header-modern">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                      <i className="fas fa-chart-line text-lg text-warning"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Status do Período</h3>
                      <p className="text-sm text-muted-foreground">Progresso geral das metas</p>
                    </div>
                  </div>
                  <Badge className="badge-modern badge-warning">
                    <i className="fas fa-clock text-xs mr-1"></i>
                    Em Andamento
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Detalhes por Categoria */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
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
                <Card key={index} className="card-modern hover:shadow-lg transition-shadow">
                  <CardHeader className="card-header-modern pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <i className={`${meta.icon} text-sm ${meta.color}`}></i>
                        </div>
                        <span className="font-semibold">{meta.nome}</span>
                      </div>
                      {meta.categoria === 'geral' && (
                        <Badge className="badge-modern badge-info text-xs">
                          <i className="fas fa-star text-xs mr-1"></i>
                          Principal
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
                            ? "Dados não disponíveis para esta data." 
                            : "Meta não definida para esta categoria."
                          }
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                              <i className="fas fa-bullseye text-xs text-primary"></i>
                              Meta:
                            </span>
                            <span className="font-semibold text-foreground">{formatCurrency(meta.meta)}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                              <i className="fas fa-chart-bar text-xs text-primary"></i>
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
                          <Progress 
                            value={Math.min(meta.progresso, 100)} 
                            className="h-2"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="text-center p-3 bg-muted/10 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">Restante</div>
                            <div className="font-medium text-sm">{formatCurrency(meta.restante)}</div>
                          </div>
                          <div className="text-center p-3 bg-muted/10 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">Meta Diária</div>
                            <div className="font-medium text-sm">{formatCurrency(meta.metaDiaria)}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
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
                                Faltam {formatCurrency(meta.restante)} para atingir a meta
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
    </div>
  );
}