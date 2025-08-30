import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { MobileSidebar } from '@/components/MobileSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Calendar, DollarSign, TrendingUp, LogOut } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

export default function Vendas() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('all');
  const [periodoFilter, setPeriodoFilter] = useState<string>('hoje');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchVendas();
  }, [periodoFilter]);

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

  const filteredVendas = vendas.filter(venda => {
    const matchesSearch = venda.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = categoriaFilter === 'all' || venda.categoria === categoriaFilter;
    
    return matchesSearch && matchesCategoria;
  });

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
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex w-64 min-h-screen border-r border-border">
          <DashboardSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-card border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <MobileSidebar />
                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    Vendas - Loja {user.loja_id}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Acompanhe as vendas e performance da loja
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-destructive hover:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="p-4 sm:p-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Vendas</p>
                      <p className="text-2xl font-bold text-foreground">
                        R$ {totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                      <SelectItem value="similar">Similar</SelectItem>
                      <SelectItem value="generico">Genérico</SelectItem>
                      <SelectItem value="dermocosmetico">Dermocosmético</SelectItem>
                      <SelectItem value="goodlife">GoodLife</SelectItem>
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

            {/* Sales Table */}
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
          </main>
        </div>
      </div>
    </div>
  );
}