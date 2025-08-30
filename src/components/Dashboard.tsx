import { MetricCard } from "./MetricCard";
import { DashboardSidebar } from "./DashboardSidebar";
import { MobileSidebar } from "./MobileSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, BarChart3, Calendar, Trophy } from "lucide-react";

const mockMetrics = [
  {
    title: "Geral",
    value: "R$ 3.083,07",
    target: "R$ 10.514,16",
    missing: "R$ 6.581,09 hoje",
    category: "geral" as const,
    status: "pendente" as const
  },
  {
    title: "Rentáveis R+",
    value: "R$ 311,29", 
    target: "R$ 525,46",
    missing: "R$ 214,17 hoje",
    category: "rentavel" as const,
    status: "pendente" as const
  },
  {
    title: "Perfumaria R+",
    value: "R$ 468,35",
    target: "R$ 481,16", 
    missing: "R$ 12,81 hoje",
    category: "perfumaria" as const,
    status: "pendente" as const
  },
  {
    title: "Conveniência R+",
    value: "R$ 237,98",
    target: "R$ 337,75",
    missing: "R$ 99,77 hoje", 
    category: "conveniencia" as const,
    status: "pendente" as const
  },
  {
    title: "GoodLife",
    value: "R$ 84,58",
    target: "R$ 280,19",
    missing: "R$ 195,61 hoje",
    category: "goodlife" as const,
    status: "pendente" as const
  }
];

export function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex w-64 min-h-screen border-r border-border">
          <DashboardSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-card border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile Menu */}
                <MobileSidebar />
                
                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    Dashboard - Minha Loja
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Olá, FLAVIO RENE PEREIRA DA SILVA
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar Metas
                </Button>
                
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">08/2025</span>
                </Button>

                <Button className="bg-warning hover:bg-warning/90 text-warning-foreground hidden sm:flex">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Campanhas</span>
                </Button>

                <Button className="bg-success hover:bg-success/90 text-success-foreground hidden lg:flex">
                  <Trophy className="w-4 h-4 mr-2" />
                  Entenda suas premiações!
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="p-4 sm:p-6">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button variant="secondary" size="sm">
                👥 Colaboradores
              </Button>
              <Button variant="outline" size="sm" className="bg-warning text-warning-foreground">
                🏪 Vendas Hoje
              </Button>
              <Button variant="outline" size="sm">
                📊 Vendas Ontem
              </Button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
              {mockMetrics.map((metric, index) => (
                <MetricCard
                  key={index}
                  title={metric.title}
                  value={metric.value}
                  target={metric.target}
                  missing={metric.missing}
                  category={metric.category}
                  status={metric.status}
                />
              ))}
            </div>

            {/* Summary */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Resumo das Comissões Totais
                </h2>
                <Badge variant="outline">
                  4/10 colaboradores
                </Badge>
              </div>
              
              <div className="text-3xl font-bold text-foreground mb-2">
                R$ 1.252,28
              </div>
              
              <p className="text-sm text-muted-foreground">
                40,0% no prazo
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}