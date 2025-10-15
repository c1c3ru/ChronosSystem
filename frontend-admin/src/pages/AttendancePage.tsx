import { useQuery } from '@tanstack/react-query';
import Card from '@/components/ui/Card';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function AttendancePage() {
  const { data: records, isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      const { data } = await api.get('/attendance');
      return data;
    },
  });

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Registros de Ponto</h1>
        <p className="text-gray-400">Histórico de entradas e saídas</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4">Usuário</th>
                <th className="text-left py-3 px-4">Tipo</th>
                <th className="text-left py-3 px-4">Máquina</th>
                <th className="text-left py-3 px-4">Data/Hora</th>
                <th className="text-left py-3 px-4">Localização</th>
              </tr>
            </thead>
            <tbody>
              {records?.map((record: any) => (
                <tr key={record.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4">{record.user.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      record.type === 'ENTRADA'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {record.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{record.machine.name}</td>
                  <td className="py-3 px-4">{formatDate(record.tsServer)}</td>
                  <td className="py-3 px-4 text-gray-400">
                    {record.geoLat && record.geoLng
                      ? `${record.geoLat.toFixed(4)}, ${record.geoLng.toFixed(4)}`
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
