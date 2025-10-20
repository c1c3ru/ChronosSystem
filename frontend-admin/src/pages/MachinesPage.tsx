import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Monitor, Edit, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import MachineModal from '@/components/modals/MachineModal';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function MachinesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: machines, isLoading } = useQuery({
    queryKey: ['machines'],
    queryFn: async () => {
      const { data } = await api.get('/machines');
      return data;
    },
  });

  const deleteMachineMutation = useMutation({
    mutationFn: async (machineId: string) => {
      await api.delete(`/machines/${machineId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines'] });
    },
  });

  const handleEdit = (machine: any) => {
    setSelectedMachine(machine);
    setIsModalOpen(true);
  };

  const handleDelete = async (machineId: string, machineName: string) => {
    if (window.confirm(`Tem certeza que deseja deletar a máquina ${machineName}?`)) {
      deleteMachineMutation.mutate(machineId);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMachine(null);
  };

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
        <Button onClick={() => setIsModalOpen(true)}>
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
                {machine.description && (
                  <p className="text-xs text-gray-500 mb-2">{machine.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      machine.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {machine.isActive ? 'Ativa' : 'Inativa'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(machine.createdAt)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(machine)}
                      className="p-1 text-gray-400 hover:text-primary transition-colors"
                      title="Editar máquina"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(machine.id, machine.name)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      title="Deletar máquina"
                      disabled={deleteMachineMutation.isPending}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {machines?.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Monitor className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium mb-2">Nenhuma máquina cadastrada</h3>
            <p className="text-gray-400 mb-4">
              Adicione sua primeira máquina de ponto para começar
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={20} className="mr-2" />
              Nova Máquina
            </Button>
          </div>
        </Card>
      )}

      <MachineModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        machine={selectedMachine}
      />

      {deleteMachineMutation.error && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400">
            {(deleteMachineMutation.error as any)?.response?.data?.message || 'Erro ao deletar máquina'}
          </p>
        </div>
      )}
    </div>
  );
}
