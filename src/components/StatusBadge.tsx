import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'pendente' | 'atingido' | 'acima';
  className?: string;
}

const statusConfig = {
  pendente: {
    label: "PENDENTE",
    className: "bg-status-pendente text-warning-foreground hover:bg-status-pendente/80"
  },
  atingido: {
    label: "ATINGIDO", 
    className: "bg-status-atingido text-success-foreground hover:bg-status-atingido/80"
  },
  acima: {
    label: "ACIMA DA META",
    className: "bg-status-acima text-info-foreground hover:bg-status-acima/80"
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}