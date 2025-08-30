import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from './useAuth';
import { type PeriodOption } from '@/contexts/PeriodContext';

export interface MetricData {
  title: string;
  value: string;
  target: string;
  missing: string;
  category: 'geral' | 'rentavel' | 'perfumaria' | 'conveniencia' | 'goodlife';
  status: 'pendente' | 'atingido' | 'acima';
}

export function useDashboardData(user: User | null, selectedPeriod?: PeriodOption | null) {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !selectedPeriod) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Buscar metas da loja atual para o período selecionado
        const { data: metasLoja } = await supabase
          .from('metas_loja')
          .select('*, metas_loja_categorias(*)')
          .eq('loja_id', user.loja_id)
          .eq('periodo_meta_id', selectedPeriod.id);

        // Buscar vendas da loja atual no período selecionado
        const { data: vendasLoja } = await supabase
          .from('vendas_loja')
          .select('*')
          .eq('loja_id', user.loja_id)
          .gte('data_venda', selectedPeriod.startDate.toISOString().split('T')[0])
          .lte('data_venda', selectedPeriod.endDate.toISOString().split('T')[0]);

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
  }, [user, selectedPeriod]);

  return { metrics, loading };
}