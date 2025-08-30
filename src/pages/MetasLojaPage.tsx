import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePeriodoAtual } from "@/hooks/usePeriodoAtual";
import { PeriodSelector } from "@/components/PeriodSelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Calendar, BarChart3, Share2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";

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

  useEffect(() => {
    fetchMetas();
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

      // Buscar vendas da loja atual no período
      const { data: vendasLoja } = await supabase
        .from('vendas_loja')
        .select('*')
        .eq('loja_id', user.loja_id)
        .gte('data_venda', periodo.dataInicio.toISOString().split('T')[0])
        .lte('data_venda', periodo.dataFim.toISOString().split('T')[0]);

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
        const metaCategoria = metasLoja?.[0]?.metas_loja_categorias?.find(
          (m: any) => m.categoria === categoria.id
        );

        // Somar vendas da categoria
        const vendasCategoria = vendasLoja?.filter(
          (v: any) => v.categoria === categoria.id
        ) || [];
        
        const totalVendido = vendasCategoria.reduce((sum: number, v: any) => sum + Number(v.valor_venda), 0);
        const metaValor = metaCategoria?.meta_valor || 0;
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

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              📊 Metas da Loja
            </h1>
            <div className="text-sm text-muted-foreground mt-1">
              <span className="font-medium">{user.loja_id} - LOJA</span>
              <br />
              <span>Período: {periodo.label}</span>
              <br />
              <span>Região: Centro (domingos não contam como dias úteis)</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={fetchMetas}
              variant="default" 
              size="sm"
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar Hoje
            </Button>
            
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Dia Específico
            </Button>
            
            <PeriodSelector />
            
            <Button variant="outline" size="sm" className="hidden md:flex">
              <BarChart3 className="w-4 h-4 mr-2" />
              Comparativo
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              className="bg-warning hover:bg-warning/90 text-warning-foreground"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando metas...</p>
          </div>
        ) : (
          <>
            {/* Status do Período */}
            <div className="mb-6 flex items-center justify-end">
              <div className="text-right">
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                  Status: Em Andamento
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Tempo: 29.6% decorrido
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString('pt-BR')} 23:40:09
                </p>
              </div>
            </div>

            {/* Detalhes por Categoria */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4 border-b-2 border-border pb-2">
                Detalhes por Categoria
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {metas.map((meta, index) => (
                  <Card key={index} className="border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-base">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{meta.icon}</span>
                          <span>{meta.nome}</span>
                        </div>
                        {meta.categoria === 'geral' && (
                          <Badge variant="outline" className="text-xs">
                            Hoje
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {meta.meta === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground text-sm">
                            {meta.categoria === 'geral' 
                              ? "Dados de Self Checkout não disponíveis para esta data." 
                              : "Meta não definida para esta categoria."
                            }
                          </p>
                          {meta.categoria === 'geral' && (
                            <p className="text-xs text-muted-foreground mt-2">
                              O módulo Self Checkout está disponível em "Self Checkout" no menu.
                            </p>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Meta:</span>
                              <span className="font-medium">{formatCurrency(meta.meta)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Realizado:</span>
                              <span className="font-medium text-primary">{formatCurrency(meta.realizado)}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progresso:</span>
                              <span className="font-medium">{meta.progresso.toFixed(1)}%</span>
                            </div>
                            <Progress 
                              value={meta.progresso} 
                              className="h-2"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Restante:</span>
                              <span className="font-medium">{formatCurrency(meta.restante)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Meta Diária:</span>
                              <span className="font-medium">{formatCurrency(meta.metaDiaria)}/dia</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Média Realizada:</span>
                              <span className="font-medium flex items-center gap-1">
                                {formatCurrency(meta.mediaRealizada)}/dia
                                {meta.mediaRealizada < meta.metaDiaria && (
                                  <AlertTriangle className="w-3 h-3 text-warning" />
                                )}
                              </span>
                            </div>
                          </div>

                          {meta.realizado < meta.meta && (
                            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-warning text-sm">
                                <AlertTriangle className="w-4 h-4" />
                                Faltam {formatCurrency(meta.restante)} para a meta diária
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
    </div>
  );
}