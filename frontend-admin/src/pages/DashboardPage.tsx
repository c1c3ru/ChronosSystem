import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Monitor, Clock, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import api from '@/lib/api';

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [users, machines, attendance] = await Promise.all([
        api.get('/users'),
        api.get('/machines'),
        api.get('/attendance'),
      ]);

      return {
        totalUsers: users.data.length,
        totalMachines: machines.data.length,
        todayAttendance: attendance.data.filter((a: any) => {
          const today = new Date().toDateString();
          return new Date(a.tsServer).toDateString() === today;
        }).length,
      };
    },
  });

  const statCards = [
    {
      title: 'Usuários',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Máquinas',
      value: stats?.totalMachines || 0,
      icon: Monitor,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Registros Hoje',
      value: stats?.todayAttendance || 0,
      icon: Clock,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Taxa de Presença',
      value: '95%',
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Visão geral do sistema de ponto</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={stat.color} size={24} />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Atividade Recente</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-md">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium">João Silva registrou entrada</p>
                <p className="text-sm text-gray-400">Há 5 minutos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-md">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium">Nova máquina cadastrada</p>
                <p className="text-sm text-gray-400">Há 1 hora</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Status do Sistema</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-md">
              <span>API Backend</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-md">
              <span>Banco de Dados</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-md">
              <span>Redis Cache</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                Online
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
