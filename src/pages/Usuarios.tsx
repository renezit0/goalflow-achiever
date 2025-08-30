import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getDescricaoTipoUsuario, getCorTipoUsuario, getTiposUsuario } from '@/utils/userTypes';

interface Usuario {
  id: number;
  nome: string;
  login: string;
  tipo: string;
  loja_id: number;
  permissao: number | null;
  status: string | null;
  CPF: string | null; // Corresponde ao nome da coluna no banco
  matricula: string | null;
  email: string | null;
  data_contratacao: string;
  avatar?: string; // URL do avatar do usuário
}

export default function Usuarios() {
  const { user, loading: authLoading } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ativo'); // Por padrão mostrar apenas ativos
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [avatars, setAvatars] = useState<Record<number, string>>({});

  // useEffect must be called before any early returns
  useEffect(() => {
    if (user) {
      fetchUsuarios();
    }
  }, [user]);

  const fetchUserAvatar = async (userId: number): Promise<string | null> => {
    try {
      const response = await fetch(`https://onev2.seellbr.com/uploads/avatars/user_${userId}_current.txt`);
      if (response.ok) {
        const avatarPath = await response.text();
        return `https://onev2.seellbr.com/${avatarPath.trim()}`;
      }
    } catch (error) {
      console.log(`Avatar não encontrado para usuário ${userId}`);
    }
    return null;
  };

  const fetchAvatars = async (usuariosList: Usuario[]) => {
    const avatarPromises = usuariosList.map(async (usuario) => {
      const avatarUrl = await fetchUserAvatar(usuario.id);
      return { id: usuario.id, avatarUrl };
    });

    const avatarResults = await Promise.all(avatarPromises);
    const avatarMap: Record<number, string> = {};
    
    avatarResults.forEach(({ id, avatarUrl }) => {
      if (avatarUrl) {
        avatarMap[id] = avatarUrl;
      }
    });

    setAvatars(avatarMap);
  };

  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('loja_id', user?.loja_id) // Filtrar apenas usuários da mesma loja
        .order('nome');

      if (error) throw error;
      
      // Mapear os dados para o tipo correto
      const mappedUsuarios = (data || []).map(userRow => ({
        ...userRow,
        permissao: Number(userRow.permissao) || 0,
        CPF: userRow.CPF || null
      }));
      
      setUsuarios(mappedUsuarios);
      
      // Buscar avatares após carregar usuários
      await fetchAvatars(mappedUsuarios);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
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

  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (usuario.matricula && usuario.matricula.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (usuario.email && usuario.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || usuario.status === statusFilter;
    const matchesTipo = tipoFilter === 'all' || usuario.tipo === tipoFilter;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'ativo':
        return <Badge variant="default" className="bg-success text-success-foreground">Ativo</Badge>;
      case 'inativo':
        return <Badge variant="secondary">Inativo</Badge>;
      case 'bloqueado':
        return <Badge variant="destructive">Bloqueado</Badge>;
      case 'pendente':
        return <Badge variant="outline" className="border-warning text-warning">Pendente</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getTipoBadge = (tipo: string) => {
    return (
      <Badge className={getCorTipoUsuario(tipo)}>
        {getDescricaoTipoUsuario(tipo)}
      </Badge>
    );
  };

  const handleEdit = (userId: number) => {
    toast.info('Funcionalidade de edição em desenvolvimento');
    // TODO: Implementar edição de usuário
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Usuários da Loja {user?.loja_id}
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os colaboradores da sua loja
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Filtros
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="relative md:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome, matrícula ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="bloqueado">Bloqueado</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                {getTiposUsuario().map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center justify-center md:justify-start">
              <span className="bg-muted px-3 py-1 rounded-full">
                Total: {filteredUsuarios.length} usuário{filteredUsuarios.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando usuários...
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="block md:hidden">
                {filteredUsuarios.map((usuario) => (
                  <div key={usuario.id} className="border-b border-border p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          {avatars[usuario.id] ? (
                            <AvatarImage 
                              src={avatars[usuario.id]} 
                              alt={`Avatar de ${usuario.nome}`}
                              className="object-cover"
                            />
                          ) : null}
                          <AvatarFallback className="text-sm">
                            {usuario.nome.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{usuario.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            Mat: {usuario.matricula || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(usuario.id)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        {usuario.status !== 'ativo' && (
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Função:</span>
                        <div className="mt-1">{getTipoBadge(usuario.tipo)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <div className="mt-1">{getStatusBadge(usuario.status)}</div>
                      </div>
                      {usuario.email && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Email:</span>
                          <p className="text-foreground truncate">{usuario.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {filteredUsuarios.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum usuário encontrado
                  </div>
                )}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsuarios.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              {avatars[usuario.id] ? (
                                <AvatarImage 
                                  src={avatars[usuario.id]} 
                                  alt={`Avatar de ${usuario.nome}`}
                                  className="object-cover"
                                />
                              ) : null}
                              <AvatarFallback className="text-xs">
                                {usuario.nome.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{usuario.nome}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {usuario.matricula || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>{getTipoBadge(usuario.tipo)}</TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {usuario.email || 'Não informado'}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(usuario.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(usuario.id)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            {usuario.status !== 'ativo' && (
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredUsuarios.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum usuário encontrado
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}