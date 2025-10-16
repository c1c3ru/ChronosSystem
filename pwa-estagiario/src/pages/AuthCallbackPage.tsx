import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refresh');

      if (token && refreshToken) {
        try {
          // Salvar tokens no localStorage
          localStorage.setItem('accessToken', token);
          localStorage.setItem('refreshToken', refreshToken);

          // Buscar dados do usuário
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            toast.success('Login realizado com sucesso!');
            navigate('/home');
          } else {
            throw new Error('Erro ao buscar dados do usuário');
          }
        } catch (error) {
          console.error('Erro no callback:', error);
          toast.error('Erro ao processar login');
          navigate('/login');
        }
      } else {
        toast.error('Parâmetros de autenticação inválidos');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="text-primary animate-spin" size={32} />
        </div>
        <h1 className="text-xl font-semibold text-white mb-2">Processando login...</h1>
        <p className="text-gray-400">Aguarde um momento</p>
      </motion.div>
    </div>
  );
}
