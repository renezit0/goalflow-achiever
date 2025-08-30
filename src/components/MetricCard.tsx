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
  icon?: string;
}

const categoryStyles = {
  geral: "border-l-category-geral",
  rentavel: "border-l-category-rentavel", 
  perfumaria: "border-l-category-perfumaria",
  conveniencia: "border-l-category-conveniencia",
  goodlife: "border-l-category-goodlife"
};

const categoryIcons = {
  geral: "fas fa-chart-bar",
  rentavel: "fas fa-money-bill-wave", 
  perfumaria: "fas fa-spray-can",
  conveniencia: "fas fa-shopping-basket",
  goodlife: "fas fa-heart"
};

const categoryIconColors = {
  geral: "text-blue-600",
  rentavel: "text-green-600", 
  perfumaria: "text-pink-600",
  conveniencia: "text-orange-600",
  goodlife: "text-purple-600"
};

export function MetricCard({ 
  title, 
  value, 
  target, 
  missing, 
  category, 
  status = 'pendente',
  className,
  icon
}: MetricCardProps) {
  const cardIcon = icon || categoryIcons[category];
  const iconColor = categoryIconColors[category];
  
  return (
    <Card className={cn(
      "card-modern border-l-4 animate-fade-in hover:shadow-lg",
      categoryStyles[category],
      className
    )}>
      <CardContent className="card-body-modern pt-6">
        <div className="flex items-center justify-between mb-4 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
              <i className={`${cardIcon} text-lg ${iconColor}`}></i>
            </div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          </div>
          <StatusBadge status={status} />
        </div>
        
        <div className="space-y-3">
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
          
          {target && (
            <div className="flex items-center gap-2">
              <i className="fas fa-bullseye text-xs text-muted-foreground"></i>
              <p className="text-sm text-muted-foreground">
                Meta diária: {target}
              </p>
            </div>
          )}
          
          {missing && (
            <div className="flex items-center gap-2 p-2 bg-error/10 rounded-lg">
              <i className="fas fa-exclamation-triangle text-xs text-error"></i>
              <p className="text-sm text-error font-medium">
                Falta {missing} hoje
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}