import { useQuery } from '@tanstack/react-query';
import { Plus, Monitor } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import api from '@/lib/api';

export default function MachinesPage() {
  const { data: machines, isLoading } = useQuery({
    queryKey: ['machines'],
    queryFn: async () => {
      const { data } = await api.get('/machines');
      return data;
    },
  });

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Máquinas de Ponto</h1>
          <p className="text-gray-400">Gerenciar máquinas e kiosks</p>
        </div>
        <Button>
          <Plus size={20} className="mr-2" />
          Nova Máquina
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {machines?.map((machine: any) => (
          <Card key={machine.id} hover>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Monitor className="text-primary" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{machine.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{machine.location}</p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    machine.isActive
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {machine.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                  <span className="text-xs text-gray-400">{machine.publicId}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
