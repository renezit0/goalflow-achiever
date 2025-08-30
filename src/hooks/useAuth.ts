import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: number;
  nome: string;
  login: string;
  tipo: string;
  loja_id: number;
  permissao: number;
  status: string;
  cpf?: string;
  matricula?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (loginInput: string, senha: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('login', loginInput)
        .eq('senha', senha)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        return { success: false, error: 'Usuário ou senha inválidos' };
      }
      
      // Mapear os dados do banco para o tipo User
      const userData: User = {
        id: data.id,
        nome: data.nome,
        login: data.login,
        tipo: data.tipo,
        loja_id: data.loja_id,
        permissao: Number(data.permissao) || 0,
        status: 'ativo',
        cpf: data.CPF || null, // Nota: banco usa 'CPF' maiúsculo
        matricula: data.matricula
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Usuário ou senha inválidos' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  return { user, login, logout, loading };
}