import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function ScanPage() {
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    );

    scanner.render(onScanSuccess, onScanError);

    return () => {
      scanner.clear();
    };
  }, []);

  const onScanSuccess = async (decodedText: string) => {
    if (processing) return;

    setProcessing(true);
    setScanning(false);

    try {
      // Obter geolocalização
      let geoLat, geoLng;
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        geoLat = position.coords.latitude;
        geoLng = position.coords.longitude;
      }

      // Determinar tipo (ENTRADA ou SAIDA)
      const { data: lastRecord } = await api.get(`/attendance/user/${user?.id}`);
      const type = lastRecord[0]?.type === 'ENTRADA' ? 'SAIDA' : 'ENTRADA';

      // Registrar ponto
      await api.post('/attendance/scan', {
        qrData: decodedText,
        type,
        geoLat,
        geoLng,
        deviceInfo: navigator.userAgent,
      });

      toast.success(`${type} registrada com sucesso!`);
      
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao registrar ponto');
      setScanning(true);
      setProcessing(false);
    }
  };

  const onScanError = (error: string) => {
    // Ignorar erros de scan contínuo
    if (!error.includes('NotFoundException')) {
      console.error(error);
    }
  };

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
            <h1 className="text-2xl font-bold">Escanear QR Code</h1>
            <p className="text-gray-400 text-sm">Aponte para o QR da máquina</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface rounded-2xl p-6 border border-white/10"
        >
          {scanning && (
            <div id="qr-reader" className="w-full"></div>
          )}

          {processing && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-4"></div>
              <p className="text-lg font-semibold">Processando...</p>
            </div>
          )}
        </motion.div>

        <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-blue-400">
            💡 <strong>Dica:</strong> Mantenha a câmera estável e aponte diretamente para o QR code da máquina de ponto.
          </p>
        </div>
      </div>
    </div>
  );
}
