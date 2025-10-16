<<<<<<< HEAD
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import api from '@/lib/api';

interface MachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  machine?: any;
}

export default function MachineModal({ isOpen, onClose, machine }: MachineModalProps) {
  const [formData, setFormData] = useState({
    name: machine?.name || '',
    location: machine?.location || '',
    description: machine?.description || '',
    isActive: machine?.isActive ?? true,
  });

  const queryClient = useQueryClient();

  const createMachineMutation = useMutation({
    mutationFn: async (machineData: any) => {
      const { data } = await api.post('/machines', machineData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      onClose();
      setFormData({ name: '', location: '', description: '', isActive: true });
    },
  });

  const updateMachineMutation = useMutation({
    mutationFn: async (machineData: any) => {
      const { data } = await api.put(`/machines/${machine.id}`, machineData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (machine) {
      updateMachineMutation.mutate(formData);
    } else {
      createMachineMutation.mutate(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-md mx-4">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {machine ? 'Editar Máquina' : 'Nova Máquina'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ex: Kiosk Principal"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Localização</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Ex: Recepção - Térreo"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Descrição opcional da máquina..."
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary resize-none"
              />
            </div>

            {machine && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-sm">Máquina ativa</label>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createMachineMutation.isPending || updateMachineMutation.isPending}
              >
                {createMachineMutation.isPending || updateMachineMutation.isPending
                  ? 'Salvando...'
                  : machine
                  ? 'Atualizar'
                  : 'Criar'
                }
              </Button>
            </div>
          </form>

          {(createMachineMutation.error || updateMachineMutation.error) && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">
                {(createMachineMutation.error as any)?.response?.data?.message || 
                 (updateMachineMutation.error as any)?.response?.data?.message ||
                 'Erro ao salvar máquina'}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
=======
[conteúdo completo do arquivo]
>>>>>>> 935f7b70044b3bbc872b4c4fe5c0bd4035148ce5
