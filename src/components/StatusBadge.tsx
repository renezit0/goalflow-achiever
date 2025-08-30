import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'pendente' | 'atingido' | 'acima';
  className?: string;
}

const statusConfig = {
  pendente: {
    label: "PENDENTE",
    icon: "fas fa-clock",
    className: "badge-modern badge-warning"
  },
  atingido: {
    label: "ATINGIDO", 
    icon: "fas fa-check-circle",
    className: "badge-modern badge-success"
  },
  acima: {
    label: "ACIMA DA META",
    icon: "fas fa-trophy",
    className: "badge-modern badge-info"
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge className={cn(config.className, "gap-1.5", className)}>
      <i className={`${config.icon} text-xs`}></i>
      {config.label}
    </Badge>
  );
}