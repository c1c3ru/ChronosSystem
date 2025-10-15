import { useQuery } from '@tanstack/react-query';
import Card from '@/components/ui/Card';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function AuditPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data } = await api.get('/audit/logs');
      return data;
    },
  });

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Auditoria</h1>
        <p className="text-gray-400">Logs de ações do sistema</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4">Usuário</th>
                <th className="text-left py-3 px-4">Ação</th>
                <th className="text-left py-3 px-4">Recurso</th>
                <th className="text-left py-3 px-4">Data/Hora</th>
                <th className="text-left py-3 px-4">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs?.map((log: any) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4">{log.actor?.name || 'Sistema'}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-primary/20 text-primary rounded text-sm">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{log.resource}</td>
                  <td className="py-3 px-4">{formatDate(log.ts)}</td>
                  <td className="py-3 px-4 text-gray-400">{log.ipAddress || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
