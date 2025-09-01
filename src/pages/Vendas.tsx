import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Calendar, DollarSign, TrendingUp, BarChart3, LineChart } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Venda {
  id: number;
  data_venda: string;
  valor_venda: number;
  categoria: string;
  quantidade: number;
  loja_id: number;
  observacao: number | null;
  data_registro: string | null;
  registrado_por_usuario_id: number | null;
}

interface ChartData {
  date: string;
  value: number;
  quantity: number;
  transactions: number;
}

export default function Vendas() {
  const { user, loading: authLoading } = useAuth();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [vendedores, setVendedores] = useState<{id: number, nome: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('geral'); // Começar com 'geral' por padrão
  const [periodoFilter, setPeriodoFilter] = useState<string>('completo'); // Período completo por padrão
  const [vendedorFilter, setVendedorFilter] = useState<string>('all');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [lojaInfo, setLojaInfo] = useState<{ regiao: string } | null>(null);

  // useEffect must be called before any early returns
  useEffect(() => {
    if (user) {
      fetchLojaInfo();
      fetchVendedores();
      fetchVendas();
      generateChartData();
    }
  }, [periodoFilter, vendedorFilter, user]);

  const fetchVendedores = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome')
        .eq('loja_id', user.loja_id)
        .order('nome');

      if (error) throw error;
      setVendedores(data || []);
    } catch (error) {
      console.error('Erro ao buscar vendedores:', error);
    }
  };

  const fetchLojaInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('lojas')
        .select('regiao')
        .eq('id', user.loja_id)
        .single();

      if (error) throw error;
      setLojaInfo(data);
    } catch (error) {
      console.error('Erro ao buscar informações da loja:', error);
    }
  };

  const fetchVendas = async () => {
    try {
      let query = supabase
        .from('vendas_loja')
        .select('*')
        .eq('loja_id', user.loja_id)
        .order('data_venda', { ascending: false });

      // Filtro por período
      const hoje = new Date();
      if (periodoFilter === 'hoje') {
        const hojeStr = format(hoje, 'yyyy-MM-dd');
        query = query.eq('data_venda', hojeStr);
      } else if (periodoFilter === 'semana') {
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - 7);
        query = query.gte('data_venda', format(inicioSemana, 'yyyy-MM-dd'));
      } else if (periodoFilter === 'mes') {
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        query = query.gte('data_venda', format(inicioMes, 'yyyy-MM-dd'));
      }
      // Se for 'completo', não aplica filtro de data

      // Filtro por vendedor
      if (vendedorFilter !== 'all') {
        query = query.eq('registrado_por_usuario_id', parseInt(vendedorFilter));
      }

      const { data, error } = await query;

      if (error) throw error;
      setVendas(data || []);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      toast.error('Erro ao carregar vendas');
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = async () => {
    try {
      // Buscar dados dos últimos 30 dias
      const hoje = new Date();
      const inicioMes = startOfMonth(subMonths(hoje, 2)); // 3 meses atrás
      
      const { data, error } = await supabase
        .from('vendas_loja')
        .select('*')
        .eq('loja_id', user.loja_id)
        .gte('data_venda', format(inicioMes, 'yyyy-MM-dd'))
        .lte('data_venda', format(hoje, 'yyyy-MM-dd'));

      if (error) throw error;

      // Agrupar por data
      const chartMap = new Map<string, ChartData>();
      
      // Inicializar com todos os dias do período (excluindo domingos se região centro)
      const allDays = eachDayOfInterval({ start: inicioMes, end: hoje });
      
      allDays.forEach(day => {
        const dayOfWeek = getDay(day);
        // Se for loja da região centro e for domingo (0), pular
        if (lojaInfo?.regiao === 'centro' && dayOfWeek === 0) {
          return;
        }
        
        const dateStr = format(day, 'yyyy-MM-dd');
        chartMap.set(dateStr, {
          date: format(day, 'dd/MM'),
          value: 0,
          quantity: 0,
          transactions: 0
        });
      });

      // Processar vendas
      (data || []).forEach(venda => {
        const existing = chartMap.get(venda.data_venda);
        if (existing) {
          existing.value += venda.valor_venda;
          existing.quantity += venda.quantidade;
          existing.transactions += 1;
        }
      });

      setChartData(Array.from(chartMap.values()));
    } catch (error) {
      console.error('Erro ao gerar dados do gráfico:', error);
    }
  };

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const filteredVendas = vendas.filter(venda => {
    const matchesSearch = venda.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = categoriaFilter === 'all' || venda.categoria === categoriaFilter;
    
    return matchesSearch && matchesCategoria;
  });

  const totalVendas = filteredVendas.reduce((sum, venda) => sum + venda.valor_venda, 0);

  // Separar totais por categoria
  const vendasGeral = vendas.filter(v => v.categoria === 'geral');
  const totalGeralVendas = vendasGeral.reduce((sum, venda) => sum + venda.valor_venda, 0);
  
  // Calcular participações e indicadores
  const valorTotalTodas = vendas.reduce((sum, venda) => sum + venda.valor_venda, 0);
  const participacaoGeral = valorTotalTodas > 0 ? (totalGeralVendas / valorTotalTodas * 100) : 0;
  
  // Vendas por categoria para indicadores
  const vendasPorCategoria = vendas.reduce((acc, venda) => {
    if (!acc[venda.categoria]) {
      acc[venda.categoria] = { valor: 0, transacoes: 0 };
    }
    acc[venda.categoria].valor += venda.valor_venda;
    acc[venda.categoria].transacoes += 1;
    return acc;
  }, {} as Record<string, { valor: number; transacoes: number }>);

  // Ticket médio
  const ticketMedio = filteredVendas.length > 0 ? totalVendas / filteredVendas.length : 0;

  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      geral: 'bg-blue-500 text-white',
      similar: 'bg-green-500 text-white',
      generico: 'bg-purple-500 text-white',
      dermocosmetico: 'bg-pink-500 text-white',
      goodlife: 'bg-orange-500 text-white',
      perfumaria_alta: 'bg-red-500 text-white',
      conveniencia: 'bg-yellow-500 text-black',
      brinquedo: 'bg-cyan-500 text-white'
    };
    
    return colors[categoria] || 'bg-gray-500 text-white';
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Vendas - Loja {user.loja_id}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Acompanhe as vendas e performance da loja
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Participação Geral</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">
                  {participacaoGeral.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  R$ {totalGeralVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">
                  R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Por transação
                </p>
              </div>
              <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Categorias Ativas</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{Object.keys(vendasPorCategoria).length}</p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Com vendas no período
                </p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Transações</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{filteredVendas.length}</p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Vendas realizadas
                </p>
              </div>
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores por Categoria */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            Indicadores por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Object.entries(vendasPorCategoria)
              .sort(([,a], [,b]) => b.valor - a.valor)
              .slice(0, 6)
              .map(([categoria, dados]) => {
                const participacao = valorTotalTodas > 0 ? (dados.valor / valorTotalTodas * 100) : 0;
                return (
                  <div key={categoria} className="p-3 sm:p-4 border rounded-lg bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getCategoriaColor(categoria)} variant="secondary">
                        <span className="text-xs">{categoria.replace('_', ' ').toUpperCase()}</span>
                      </Badge>
                      <span className="text-xs sm:text-sm font-medium">{participacao.toFixed(1)}%</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-base sm:text-lg font-bold">
                        R$ {dados.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        <span>{dados.transacoes} vendas</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>Filtros</span>
            <Button size="sm" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nova Venda
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completo">Período Completo</SelectItem>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="semana">Última Semana</SelectItem>
                <SelectItem value="mes">Este Mês</SelectItem>
              </SelectContent>
            </Select>

            <Select value={vendedorFilter} onValueChange={setVendedorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Vendedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Vendedores</SelectItem>
                {vendedores.map((vendedor) => (
                  <SelectItem key={vendedor.id} value={vendedor.id.toString()}>
                    {vendedor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="geral">Geral</SelectItem>
                <SelectItem value="r_mais">Rentáveis R+</SelectItem>
                <SelectItem value="perfumaria_r_mais">Perfumaria R+</SelectItem>
                <SelectItem value="conveniencia_r_mais">Conveniência R+</SelectItem>
                <SelectItem value="saude">GoodLife</SelectItem>
                <SelectItem value="similar">Similar</SelectItem>
                <SelectItem value="generico">Genérico</SelectItem>
                <SelectItem value="dermocosmetico">Dermocosmético</SelectItem>
                <SelectItem value="perfumaria_alta">Perfumaria Alta</SelectItem>
                <SelectItem value="conveniencia">Conveniência</SelectItem>
                <SelectItem value="brinquedo">Brinquedo</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-xs sm:text-sm text-muted-foreground flex items-center">
              Total: {filteredVendas.length} vendas
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts and Table */}
      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="charts" className="flex items-center gap-2 text-sm">
            <LineChart className="w-4 h-4" />
            <span className="hidden sm:inline">Gráficos</span>
            <span className="sm:hidden">Gráfico</span>
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Lista de Vendas</span>
            <span className="sm:hidden">Lista</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de Vendas por Dia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Vendas por Dia</span>
                  <span className="sm:hidden">Vendas/Dia</span>
                  {lojaInfo?.regiao === 'centro' && (
                    <Badge variant="secondary" className="text-xs">
                      Dom. fechados
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsLineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs text-muted-foreground"
                    />
                    <YAxis 
                      className="text-xs text-muted-foreground"
                      tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Vendas']}
                      labelFormatter={(label) => `Data: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Transações por Dia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Transações por Dia</span>
                  <span className="sm:hidden">Transações/Dia</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs text-muted-foreground"
                    />
                    <YAxis className="text-xs text-muted-foreground" />
                    <Tooltip 
                      formatter={(value: number) => [value, 'Transações']}
                      labelFormatter={(label) => `Data: ${label}`}
                    />
                    <Bar 
                      dataKey="transactions" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Lista de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando vendas...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Data</TableHead>
                        <TableHead className="text-xs sm:text-sm">Categoria</TableHead>
                        <TableHead className="text-xs sm:text-sm">Valor</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Vendedor</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Registro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVendas.map((venda) => {
                        const vendedor = vendedores.find(v => v.id === venda.registrado_por_usuario_id);
                        return (
                          <TableRow key={venda.id}>
                            <TableCell className="text-xs sm:text-sm">
                              {format(new Date(venda.data_venda), 'dd/MM/yyyy', { locale: ptBR })}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getCategoriaColor(venda.categoria)} text-xs`}>
                                <span className="hidden sm:inline">{venda.categoria.replace('_', ' ').toUpperCase()}</span>
                                <span className="sm:hidden">{venda.categoria.substring(0, 6).toUpperCase()}</span>
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-xs sm:text-sm">
                              R$ {venda.valor_venda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm text-muted-foreground hidden sm:table-cell">
                              {vendedor?.nome || 'N/A'}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                              {venda.data_registro ? 
                                format(new Date(venda.data_registro), 'dd/MM/yyyy HH:mm', { locale: ptBR }) :
                                'Não informado'
                              }
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {filteredVendas.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Nenhuma venda encontrada para os filtros selecionados
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}