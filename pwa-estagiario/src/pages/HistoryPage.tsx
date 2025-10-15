import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: records, isLoading } = useQuery({
    queryKey: ['history', user?.id],
    queryFn: async () => {
      const { data } = await api.get(`/attendance/user/${user?.id}`);
      return data;
    },
    enabled: !!user?.id,
  });

  const groupByDate = (records: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    
    records?.forEach((record) => {
      const date = new Date(record.tsServer).toLocaleDateString('pt-BR');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(record);
    });

    return grouped;
  };

  const groupedRecords = groupByDate(records || []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/home')}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Meu Histórico</h1>
            <p className="text-gray-400 text-sm">Registros de ponto</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedRecords).map(([date, dayRecords], index) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <h2 className="text-sm font-semibold text-gray-400 mb-3">{date}</h2>
                <div className="space-y-3">
                  {dayRecords.map((record: any) => (
                    <div
                      key={record.id}
                      className="bg-surface rounded-xl p-4 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-gray-400" />
                          <span className="font-semibold">
                            {new Date(record.tsServer).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            record.type === 'ENTRADA'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {record.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{record.machine.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{record.machine.location}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            {records?.length === 0 && (
              <div className="text-center py-12">
                <Clock size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Nenhum registro encontrado</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
