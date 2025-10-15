import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, Clock, LogOut, History } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function HomePage() {
  const { user, logout } = useAuth();

  const { data: lastRecord } = useQuery({
    queryKey: ['last-record', user?.id],
    queryFn: async () => {
      const { data } = await api.get(`/attendance/user/${user?.id}`);
      return data[0];
    },
    enabled: !!user?.id,
  });

  const nextAction = lastRecord?.type === 'ENTRADA' ? 'SAÍDA' : 'ENTRADA';

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Olá, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut size={20} className="text-gray-400" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Card de Status */}
          <div className="bg-surface rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-primary" size={24} />
              <div>
                <p className="text-sm text-gray-400">Próxima ação</p>
                <p className="text-2xl font-bold text-primary">{nextAction}</p>
              </div>
            </div>
            {lastRecord && (
              <p className="text-sm text-gray-400">
                Último registro: {lastRecord.type} às{' '}
                {new Date(lastRecord.tsServer).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>

          {/* Botão de Escanear */}
          <Link to="/scan">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary hover:bg-primary-600 rounded-2xl p-8 flex flex-col items-center gap-4 transition-colors"
            >
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <QrCode size={40} />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">Escanear QR Code</p>
                <p className="text-sm opacity-80">Registrar {nextAction.toLowerCase()}</p>
              </div>
            </motion.button>
          </Link>

          {/* Botão de Histórico */}
          <Link to="/history">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white/5 hover:bg-white/10 rounded-2xl p-6 flex items-center gap-4 transition-colors border border-white/10"
            >
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <History size={24} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Meu Histórico</p>
                <p className="text-sm text-gray-400">Ver registros anteriores</p>
              </div>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
