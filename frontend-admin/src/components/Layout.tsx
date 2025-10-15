import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Monitor,
  Clock,
  BarChart3,
  Shield,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Usuários', path: '/users', roles: ['ADMIN', 'SUPERVISOR'] },
  { icon: Monitor, label: 'Máquinas', path: '/machines', roles: ['ADMIN', 'SUPERVISOR'] },
  { icon: Clock, label: 'Registros', path: '/attendance' },
  { icon: BarChart3, label: 'Relatórios', path: '/reports', roles: ['ADMIN', 'SUPERVISOR'] },
  { icon: Shield, label: 'Auditoria', path: '/audit', roles: ['ADMIN', 'AUDIT'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role || '')
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col glass border-r border-white/10">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold text-primary">Ponto Admin</h1>
          <p className="text-sm text-muted mt-1">{user?.name}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-md transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:bg-white/5'
                  )}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 glass border-b border-white/10 flex items-center justify-between px-4 z-50">
        <h1 className="text-xl font-bold text-primary">Ponto Admin</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="md:hidden fixed left-0 top-16 bottom-0 w-64 glass border-r border-white/10 z-40"
        >
          <nav className="p-4 space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-md transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-300 hover:bg-white/5'
                    )}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </motion.aside>
      )}

      {/* Main Content */}
      <main className="md:ml-64 pt-16 md:pt-0 min-h-screen">
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
