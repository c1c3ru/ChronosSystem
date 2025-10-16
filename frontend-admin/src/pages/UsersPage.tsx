import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import UserModal from '@/components/modals/UserModal';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data;
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (window.confirm(`Tem certeza que deseja deletar o usuário ${userName}?`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Usuários</h1>
          <p className="text-gray-400">Gerenciar usuários do sistema</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4">Nome</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Matrícula</th>
                <th className="text-left py-3 px-4">Função</th>
                <th className="text-left py-3 px-4">Contrato</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user: any) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{user.fullName || user.name}</div>
                      {user.fullName && <div className="text-sm text-gray-400">@{user.name}</div>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{user.email}</td>
                  <td className="py-3 px-4 text-gray-400">{user.employeeId || '-'}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-primary/20 text-primary rounded text-sm">
                      {user.role === 'ADMIN' ? 'Administrador' : 
                       user.role === 'MANAGER' ? 'Gerente' : 'Funcionário'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-sm">
                    {user.contractStartDate && (
                      <div>
                        <div>Início: {formatDate(user.contractStartDate)}</div>
                        {user.contractEndDate && (
                          <div>Fim: {formatDate(user.contractEndDate)}</div>
                        )}
                      </div>
                    )}
                    {!user.contractStartDate && '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      user.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1 text-gray-400 hover:text-primary transition-colors"
                        title="Editar usuário"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Deletar usuário"
                        disabled={deleteUserMutation.isPending}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
      />

      {deleteUserMutation.error && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400">
            {(deleteUserMutation.error as any)?.response?.data?.message || 'Erro ao deletar usuário'}
          </p>
        </div>
      )}
    </div>
  );
}
