import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";

interface SidebarItem {
  icon: string;
  label: string;
  href: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: "fas fa-tachometer-alt", label: "Dashboard", href: "/" },
  { icon: "fas fa-chart-line", label: "Vendas", href: "/vendas" },
  { icon: "fas fa-bullseye", label: "Metas", href: "/metas" },
  { icon: "fas fa-store", label: "Metas da Loja", href: "/metas-loja" },
  { icon: "fas fa-megaphone", label: "Campanhas", href: "/campanhas" },
  { icon: "fas fa-file-alt", label: "Relatórios", href: "/relatorios" },
  { icon: "fas fa-users", label: "Usuários", href: "/usuarios" },
  { icon: "fas fa-cog", label: "Configurações", href: "/configuracoes" }
];

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className={cn(
      "sidebar fixed z-50 flex flex-col h-full text-white shadow-lg transition-all duration-300 ease-in-out",
      "w-[70px] hover:w-[220px] group",
      className
    )}>
      {/* Header */}
      <div className="sidebar-header flex items-center justify-center p-3 mb-3">
        <div className="sidebar-logo flex items-center">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white/10">
            <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
          </div>
          <div className="logo-text ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-lg font-semibold">Loja {user?.loja_id}</span>
          </div>
        </div>
      </div>

      {/* User Info - Show on hover */}
      <div className="px-3 pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="text-xs text-white/60 text-center">
          <p className="capitalize">{user?.tipo}</p>
          <p>Olá, {user?.nome}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav-menu flex-1 flex flex-col gap-1 px-2">
        {sidebarItems.map((item, index) => {
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={index}
              to={item.href}
              className={cn(
                "nav-item flex items-center p-3 rounded-lg text-white/80 transition-all duration-150 relative",
                "hover:bg-white/8 hover:text-white",
                isActive && "active bg-white/10 text-white border-l-3 border-l-secondary pl-[10px]"
              )}
            >
              <div className={cn(
                "nav-icon min-w-[38px] h-[38px] rounded-lg bg-white/10 flex items-center justify-center transition-all duration-150",
                (isActive || "group-hover:bg-secondary") && "bg-secondary text-white"
              )}>
                <i className={`${item.icon} text-base`}></i>
              </div>
              <span className="nav-label ml-3 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-[120px] whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="user-profile flex items-center p-3 border-t border-white/10 sticky bottom-0">
        <div className="user-avatar w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">
          {user?.nome?.charAt(0) || "U"}
        </div>
        <div className="user-info ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 overflow-hidden">
          <div className="user-name text-white font-semibold text-sm truncate">
            {user?.nome}
          </div>
          <div className="user-role text-white/60 text-xs truncate capitalize">
            {user?.tipo}
          </div>
        </div>
      </div>
    </div>
  );
}