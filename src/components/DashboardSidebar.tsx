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

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const sidebarItems: SidebarItem[] = [
  { icon: Home, label: "Dashboard", active: true },
  { icon: TrendingUp, label: "Vendas Sua Loja" },
  { icon: Users, label: "SelfCheckout" },
  { icon: Target, label: "Ocorrências" },
  { icon: BarChart3, label: "Consulta Preço Site" },
  { icon: Calendar, label: "Aniversários" },
  { icon: FileText, label: "Tutoriais/Recados (test)" },
  { icon: DollarSign, label: "Vendas Colaboradores" },
  { icon: Settings, label: "Lançar Vendas" },
  { icon: Settings, label: "Gerenciamento" },
  { icon: Settings, label: "Orçamentos" },
  { icon: Settings, label: "Proj. de Metas (test)" }
];

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  return (
    <div className={cn(
      "flex flex-col bg-sidebar text-sidebar-foreground",
      className
    )}>
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-sm">F</span>
          </div>
          <div>
            <h1 className="font-semibold text-sm">Dashboard - Minha Loja</h1>
            <p className="text-xs text-sidebar-foreground/70">
              Olá, FLAVIO RENE PEREIRA DA SILVA
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/70">Gerente Loja</p>
        <p className="text-xs text-sidebar-foreground/70">22 - BITTENCOURT</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {sidebarItems.map((item, index) => (
            <Button
              key={index}
              variant={item.active ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-left px-3 py-2 h-auto",
                item.active 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              onClick={item.onClick}
            >
              <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-sidebar-accent rounded-full"></div>
          <div className="text-xs text-sidebar-foreground/70">
            <p>FLAVIO RE...</p>
            <p>Gerente Loja</p>
          </div>
        </div>
      </div>
    </div>
  );
}