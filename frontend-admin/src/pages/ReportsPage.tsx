import Card from '@/components/ui/Card';
import { BarChart3, Download } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Relatórios</h1>
          <p className="text-gray-400">Análises e exportações</p>
        </div>
        <Button>
          <Download size={20} className="mr-2" />
          Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="text-primary" size={24} />
            <h2 className="text-xl font-semibold">Horas Trabalhadas</h2>
          </div>
          <p className="text-3xl font-bold mb-2">168h</p>
          <p className="text-sm text-gray-400">Este mês</p>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="text-primary" size={24} />
            <h2 className="text-xl font-semibold">Taxa de Presença</h2>
          </div>
          <p className="text-3xl font-bold mb-2">95%</p>
          <p className="text-sm text-gray-400">Últimos 30 dias</p>
        </Card>
      </div>
    </div>
  );
}
