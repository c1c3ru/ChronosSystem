import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeRegistration } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contractStartDate: '',
    contractEndDate: '',
    totalContractHours: 800,
    weeklyHours: 30,
    dailyHours: 6,
  });

  const userId = searchParams.get('userId');
  const email = searchParams.get('email');
  const name = searchParams.get('name');

  useEffect(() => {
    if (!userId || !email || !name) {
      navigate('/login');
    }
  }, [userId, email, name, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);

    try {
      await completeRegistration(userId, formData);
      navigate('/');
    } catch (error) {
      console.error('Erro ao completar cadastro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!userId || !email || !name) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-surface rounded-2xl p-8 border border-white/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-primary" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">Complete seu Cadastro</h1>
            <p className="text-gray-400">Olá, {decodeURIComponent(name)}!</p>
            <p className="text-sm text-gray-500 mt-1">{decodeURIComponent(email)}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Data de Início do Contrato</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  value={formData.contractStartDate}
                  onChange={(e) => handleInputChange('contractStartDate', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Data de Término do Contrato</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  value={formData.contractEndDate}
                  onChange={(e) => handleInputChange('contractEndDate', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Carga Horária Total (horas)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  value={formData.totalContractHours}
                  onChange={(e) => handleInputChange('totalContractHours', parseInt(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Horas Semanais</label>
                <input
                  type="number"
                  value={formData.weeklyHours}
                  onChange={(e) => handleInputChange('weeklyHours', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  min="1"
                  max="44"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Horas Diárias</label>
                <input
                  type="number"
                  value={formData.dailyHours}
                  onChange={(e) => handleInputChange('dailyHours', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  min="1"
                  max="8"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-300">
                <strong>Informação:</strong> Estes dados são necessários para calcular sua carga horária e gerar relatórios precisos do seu estágio.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-600 rounded-lg font-semibold transition-colors disabled:opacity-50 mt-6"
            >
              {loading ? 'Finalizando cadastro...' : 'Finalizar Cadastro'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
