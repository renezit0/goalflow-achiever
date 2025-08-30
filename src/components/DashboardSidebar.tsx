import { 
  BarChart3,
  DollarSign,
  Home,
  Settings,
  TrendingUp,
  Users,
  Target,
  FileText,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: TrendingUp, label: "Vendas", href: "/vendas" },
  { icon: Target, label: "Metas", href: "/metas" },
  { icon: BarChart3, label: "Campanhas", href: "/campanhas" },
  { icon: FileText, label: "Relatórios", href: "/relatorios" },
  { icon: Users, label: "Usuários", href: "/usuarios" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" }
];

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className={cn(
      "flex flex-col bg-sidebar text-sidebar-foreground",
      className
    )}>
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-sm">
              {user?.nome?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h1 className="font-semibold text-sm">Dashboard - Loja {user?.loja_id}</h1>
            <p className="text-xs text-sidebar-foreground/70">
              Olá, {user?.nome}
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/70 capitalize">{user?.tipo}</p>
        <p className="text-xs text-sidebar-foreground/70">Loja {user?.loja_id}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {sidebarItems.map((item, index) => {
            const isActive = location.pathname === item.href;
            return (
              <Button
                key={index}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-left px-3 py-2 h-auto",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                asChild
              >
                <Link to={item.href}>
                  <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-sidebar-accent rounded-full flex items-center justify-center">
            <span className="text-xs text-sidebar-accent-foreground">
              {user?.nome?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="text-xs text-sidebar-foreground/70">
            <p className="truncate max-w-24">{user?.nome}</p>
            <p className="capitalize">{user?.tipo}</p>
          </div>
        </div>
      </div>
    </div>
  );
}