import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { usePeriodoAtual } from "@/hooks/usePeriodoAtual";

interface PeriodOption {
  label: string;
  startDate: Date;
  endDate: Date;
  status?: 'current' | 'past' | 'future';
}

export function PeriodSelector() {
  const periodoAtual = usePeriodoAtual();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>({
    label: periodoAtual.label,
    startDate: periodoAtual.dataInicio,
    endDate: periodoAtual.dataFim,
    status: 'current'
  });

  // Gerar períodos (atual + 4 anteriores + 2 futuros)
  const periods: PeriodOption[] = [];
  
  for (let offset = -4; offset <= 2; offset++) {
    const date = new Date();
    date.setMonth(date.getMonth() + offset);
    
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const startDate = new Date(year, month, 21);
    const endDate = new Date(year, month + 1, 20);
    
    // Ajustar se necessário
    if (startDate.getMonth() !== month) {
      startDate.setDate(1);
    }
    if (endDate.getMonth() !== month + 1) {
      endDate.setDate(0);
    }
    
    const startMonth = String(startDate.getMonth() + 1).padStart(2, '0');
    const startYear = startDate.getFullYear();
    const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
    const endYear = endDate.getFullYear();
    
    const label = `${startMonth}/${startYear} a ${endMonth}/${endYear}`;
    
    let status: 'current' | 'past' | 'future' = 'current';
    const now = new Date();
    if (endDate < now) status = 'past';
    if (startDate > now) status = 'future';
    
    periods.push({
      label,
      startDate,
      endDate,
      status: offset === 0 ? 'current' : status
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 bg-card border-border">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">{selectedPeriod.label}</span>
          <span className="sm:hidden">Período</span>
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-64 bg-popover border-border shadow-lg z-50"
      >
        {periods.map((period, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => setSelectedPeriod(period)}
            className="flex items-center justify-between py-3 px-4 hover:bg-accent cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {period.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {period.startDate.toLocaleDateString('pt-BR')} - {period.endDate.toLocaleDateString('pt-BR')}
              </span>
            </div>
            {period.status === 'current' && (
              <Badge variant="default" className="bg-success text-success-foreground text-xs">
                Atual
              </Badge>
            )}
            {selectedPeriod.label === period.label && (
              <div className="w-2 h-2 bg-primary rounded-full ml-2" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}