import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from './useAuth';
import { usePeriodoAtual } from './usePeriodoAtual';

export interface MetricData {
  title: string;
  value: string;
  target: string;
  missing: string;
  category: 'geral' | 'rentavel' | 'perfumaria' | 'conveniencia' | 'goodlife';
  status: 'pendente' | 'atingido' | 'acima';
}

export function useDashboardData(user: User | null) {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);
  const periodo = usePeriodoAtual();

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
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

        // Processar dados para métricas
        const processedMetrics: MetricData[] = [];

        // Categorias de metas
        const categorias = [
          { id: 'geral', name: 'Geral' },
          { id: 'r_mais', name: 'Rentáveis R+' },
          { id: 'perfumaria_r_mais', name: 'Perfumaria R+' },
          { id: 'conveniencia_r_mais', name: 'Conveniência R+' },
          { id: 'saude', name: 'GoodLife' }
        ];

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
          const faltante = Math.max(0, metaValor - totalVendido);
          
          let status: 'pendente' | 'atingido' | 'acima' = 'pendente';
          if (totalVendido >= metaValor && metaValor > 0) {
            status = totalVendido > metaValor ? 'acima' : 'atingido';
          }

          processedMetrics.push({
            title: categoria.name,
            value: `R$ ${totalVendido.toFixed(2).replace('.', ',')}`,
            target: `R$ ${metaValor.toFixed(2).replace('.', ',')}`,
            missing: `R$ ${faltante.toFixed(2).replace('.', ',')} hoje`,
            category: categoria.id === 'r_mais' ? 'rentavel' : 
                     categoria.id === 'perfumaria_r_mais' ? 'perfumaria' :
                     categoria.id === 'conveniencia_r_mais' ? 'conveniencia' :
                     categoria.id === 'saude' ? 'goodlife' : 'geral',
            status
          });
        }

        setMetrics(processedMetrics);
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, periodo]);

  return { metrics, loading };
}