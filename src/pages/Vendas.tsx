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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('geral'); // Começar com 'geral' por padrão
  const [periodoFilter, setPeriodoFilter] = useState<string>('hoje');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [lojaInfo, setLojaInfo] = useState<{ regiao: string } | null>(null);

  // useEffect must be called before any early returns
  useEffect(() => {
    if (user) {
      fetchLojaInfo();
      fetchVendas();
      generateChartData();
    }
  }, [periodoFilter, user]);

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

  // Separar totais por categoria
  const vendasGeral = vendas.filter(v => v.categoria === 'geral');
  const totalGeralVendas = vendasGeral.reduce((sum, venda) => sum + venda.valor_venda, 0);
  const totalGeralQuantidade = vendasGeral.reduce((sum, venda) => sum + venda.quantidade, 0);

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

  const totalVendas = filteredVendas.reduce((sum, venda) => sum + venda.valor_venda, 0);
  const totalQuantidade = filteredVendas.reduce((sum, venda) => sum + venda.quantidade, 0);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Vendas - Loja {user.loja_id}
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe as vendas e performance da loja
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Geral</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {totalGeralVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Filtrado</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quantidade</p>
                <p className="text-2xl font-bold text-foreground">{totalQuantidade}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transações</p>
                <p className="text-2xl font-bold text-foreground">{filteredVendas.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Filtros
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nova Venda
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="semana">Última Semana</SelectItem>
                <SelectItem value="mes">Este Mês</SelectItem>
                <SelectItem value="todos">Todos</SelectItem>
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

            <div className="text-sm text-muted-foreground flex items-center">
              Total: {filteredVendas.length} vendas
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts and Table */}
      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <LineChart className="w-4 h-4" />
            Gráficos
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Lista de Vendas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de Vendas por Dia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Vendas por Dia
                  {lojaInfo?.regiao === 'centro' && (
                    <Badge variant="secondary" className="text-xs">
                      Domingos fechados
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
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
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Transações por Dia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
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
              <CardTitle>Lista de Vendas</CardTitle>
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
                        <TableHead>Data</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Registro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVendas.map((venda) => (
                        <TableRow key={venda.id}>
                          <TableCell>
                            {format(new Date(venda.data_venda), 'dd/MM/yyyy', { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoriaColor(venda.categoria)}>
                              {venda.categoria.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{venda.quantidade}</TableCell>
                          <TableCell className="font-medium">
                            R$ {venda.valor_venda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {venda.data_registro ? 
                              format(new Date(venda.data_registro), 'dd/MM/yyyy HH:mm', { locale: ptBR }) :
                              'Não informado'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredVendas.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma venda encontrada para o período selecionado
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