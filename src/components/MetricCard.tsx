import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  target?: string;
  missing?: string;
  category: 'geral' | 'rentavel' | 'perfumaria' | 'conveniencia' | 'goodlife';
  status?: 'pendente' | 'atingido' | 'acima';
  className?: string;
}

const categoryStyles = {
  geral: "border-l-category-geral",
  rentavel: "border-l-category-rentavel", 
  perfumaria: "border-l-category-perfumaria",
  conveniencia: "border-l-category-conveniencia",
  goodlife: "border-l-category-goodlife"
};


export function MetricCard({ 
  title, 
  value, 
  target, 
  missing, 
  category, 
  status = 'pendente',
  className 
}: MetricCardProps) {
  return (
    <Card className={cn(
      "border-l-4 hover:shadow-md transition-shadow",
      categoryStyles[category],
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <StatusBadge status={status} />
        </div>
        
        <div className="space-y-1">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          
          {target && (
            <p className="text-sm text-muted-foreground">
              Meta diária: {target}
            </p>
          )}
          
          {missing && (
            <p className="text-sm text-danger">
              Falta {missing} hoje
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}