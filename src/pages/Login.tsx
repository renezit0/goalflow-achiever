import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import logoImage from '@/assets/logo.png';

export default function Login() {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, login: authLogin, loading: authLoading } = useAuth();
  const { toast } = useToast();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="loading-container text-center">
          <div className="loading-spinner animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="loading-text text-foreground">
            Carregando<span className="dot-animation">...</span>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await authLogin(login, senha);
    
    if (result.success) {
      // Adicionar animação de saída
      document.body.classList.add('page-exit');
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
      
      // Pequeno delay para mostrar a animação
      setTimeout(() => {
        // A navegação será feita automaticamente pelo useAuth
      }, 1000);
    } else {
      toast({
        title: "Erro no login",
        description: result.error || "Verifique suas credenciais.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <div className="login-container min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Animated Rings */}
      <div className="ring absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80">
        <i className="ring-element absolute inset-0 border-2 rounded-full animate-spin" style={{ '--clr': 'hsl(var(--primary))' } as React.CSSProperties}></i>
        <i className="ring-element absolute inset-4 border-2 rounded-full animate-spin" style={{ '--clr': 'hsl(var(--secondary))', animationDirection: 'reverse', animationDuration: '3s' } as React.CSSProperties}></i>
        <i className="ring-element absolute inset-8 border-2 rounded-full animate-spin" style={{ '--clr': 'hsl(var(--accent))', animationDuration: '2s' } as React.CSSProperties}></i>
      </div>

      {/* Login Form */}
      <div className="login relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="login-card w-full max-w-md bg-card/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-2xl p-8 animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <img 
              src={logoImage} 
              alt="seeLL" 
              className="logo-img mx-auto h-16 w-auto mb-4 hover-scale transition-transform duration-300"
            />
            <h2 className="text-2xl font-bold text-foreground mb-2">Acessar Sistema</h2>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="inputBx">
              <Input
                type="text"
                placeholder="Digite seu usuário ou CPF"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                className="h-12 bg-background/50 border-border/50 focus:border-primary transition-all duration-300"
                autoComplete="off"
              />
            </div>

            <div className="inputBx">
              <Input
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="h-12 bg-background/50 border-border/50 focus:border-primary transition-all duration-300"
                autoComplete="off"
              />
            </div>

            <div className="remember-forgot flex items-center justify-between">
              <div className="remember-me flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(checked) => setRemember(checked === true)}
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Lembrar-me
                </label>
              </div>
            </div>

            <div className="inputBx">
              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                    <span>Entrando...</span>
                  </div>
                ) : 'Entrar'}
              </Button>
            </div>

            <div className="links text-center space-x-4">
              <a href="#" className="text-sm text-primary hover:text-primary/80 story-link transition-colors">
                Esqueceu a senha?
              </a>
              <a href="#" className="text-sm text-primary hover:text-primary/80 story-link transition-colors">
                Cadastre-se
              </a>
            </div>
          </form>

          {/* Credits */}
          <div className="credits text-center mt-8 pt-6 border-t border-border/30">
            <div className="app-version text-xs text-muted-foreground mb-2 font-mono">
              Versão 10.4
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              seeLL Todos os direitos reservados
              <br />© 2025 - Em desenvolvimento, pode apresentar erros!
            </p>
            <div className="developer-info text-xs text-muted-foreground mt-2 opacity-75">
              Por Flávio Renê
              <br />
              <a href="https://seellbr.com" className="story-link hover:text-primary transition-colors">
                seellbr.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Download Section */}
      <div className="download-section fixed bottom-5 right-5 z-50">
        <button className="download-toggle group relative w-14 h-14 bg-gradient-to-r from-primary to-secondary rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 animate-float">
          <i className="fas fa-download text-primary-foreground group-hover:scale-110 transition-transform duration-300"></i>
          <div className="new-indicator absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse"></div>
        </button>
      </div>
    </div>
  );
}