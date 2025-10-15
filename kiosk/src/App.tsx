import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, Monitor, Wifi, WifiOff } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const MACHINE_ID = import.meta.env.VITE_MACHINE_ID || 'MACHINE_001';

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);

  // Atualizar relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Verificar conectividade
  useEffect(() => {
    const checkOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', checkOnline);
    window.addEventListener('offline', checkOnline);

    return () => {
      window.removeEventListener('online', checkOnline);
      window.removeEventListener('offline', checkOnline);
    };
  }, []);

  // Buscar QR code a cada 60 segundos
  const { data: qrData, isLoading, error } = useQuery({
    queryKey: ['qr-code'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/machines/${MACHINE_ID}/qr`);
      return data.qrData;
    },
    refetchInterval: 60000, // Atualizar a cada 60 segundos
    retry: 3,
  });

  const timeString = currentTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateString = currentTime.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-gray-900 flex items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
              <Monitor className="text-primary" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">Máquina de Ponto</h1>
              <p className="text-gray-400">ID: {MACHINE_ID}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isOnline ? (
              <div className="flex items-center gap-2 text-green-400">
                <Wifi size={20} />
                <span className="text-sm font-medium">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400">
                <WifiOff size={20} />
                <span className="text-sm font-medium">Offline</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 flex flex-col items-center justify-center"
          >
            <h2 className="text-2xl font-bold mb-8 text-center">
              Escaneie o QR Code
            </h2>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-primary mb-4"></div>
                  <p className="text-gray-400">Gerando QR Code...</p>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <WifiOff size={48} className="text-red-400" />
                  </div>
                  <p className="text-red-400 font-semibold">Erro ao gerar QR Code</p>
                  <p className="text-sm text-gray-400 mt-2">Verifique a conexão</p>
                </motion.div>
              ) : (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-white p-8 rounded-2xl glow"
                >
                  <QRCodeSVG
                    value={qrData || 'loading'}
                    size={320}
                    level="H"
                    includeMargin={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-sm text-gray-400 mt-8 text-center">
              QR Code válido por 60 segundos
            </p>
          </motion.div>

          {/* Clock and Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Clock */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <Clock className="text-primary" size={32} />
                <h2 className="text-2xl font-bold">Horário Atual</h2>
              </div>
              
              <div className="text-center">
                <motion.div
                  key={timeString}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-7xl font-black text-primary mb-4 font-mono"
                >
                  {timeString}
                </motion.div>
                <p className="text-xl text-gray-400 capitalize">{dateString}</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-xl rounded-3xl p-8 border border-primary/20">
              <h3 className="text-xl font-bold mb-4 text-primary">Como usar</h3>
              <ol className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  <span>Abra o app Ponto Estagiário no seu celular</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  <span>Toque em "Escanear QR Code"</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  <span>Aponte a câmera para o QR Code acima</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </span>
                  <span>Confirme o registro de entrada ou saída</span>
                </li>
              </ol>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Sistema de Registro de Ponto • Versão 1.0.0</p>
        </div>
      </div>
    </div>
  );
}

export default App;
