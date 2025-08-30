import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import miniIconWhite from "@/assets/mini-icon-white.png";

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
  const { user, logout } = useAuth();

  return (
    <div className={cn(
      "sidebar fixed z-50 flex flex-col h-full text-white shadow-lg transition-all duration-300 ease-in-out bg-gray-900",
      "w-[70px] hover:w-[220px] group",
      className?.includes('expanded') ? "w-[220px]" : "",
      className
    )}>
      {/* Header */}
      <div className="sidebar-header flex items-center justify-center p-3 mb-3">
        <div className="sidebar-logo flex items-center">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white/10">
            <img src={miniIconWhite} alt="Logo" className="w-8 h-8 object-contain" />
          </div>
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
              <span className={cn(
                "nav-label ml-3 font-medium transition-opacity duration-200 w-[120px] whitespace-nowrap",
                className?.includes('expanded') ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}>
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
        <div className={cn(
          "user-info ml-3 transition-opacity duration-200 overflow-hidden flex-1",
          className?.includes('expanded') ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          <div className="user-name text-white font-semibold text-sm truncate">
            {user?.nome}
          </div>
          <div className="user-role text-white/60 text-xs truncate capitalize">
            {user?.tipo}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className={cn(
            "transition-opacity duration-200 ml-2 text-white hover:bg-white/10 hover:text-white",
            className?.includes('expanded') ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          <i className="fas fa-sign-out-alt text-sm"></i>
        </Button>
      </div>
    </div>
  );
}