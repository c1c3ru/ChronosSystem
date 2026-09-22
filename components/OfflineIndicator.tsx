'use client'

import React from 'react'
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus'
import { Alert } from './ui/Alert'
import { WifiOff, Wifi } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Offline Indicator Component
 *
 * Shows a banner when the user is offline and when connection is restored
 */
export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus()

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <Alert variant="warning" className="rounded-none border-x-0 border-t-0" showIcon={false}>
            <div className="flex items-center justify-center gap-2">
              <WifiOff className="h-5 w-5" aria-hidden="true" />
              <span className="font-medium">
                Você está offline. Algumas funcionalidades podem estar limitadas.
              </span>
            </div>
          </Alert>
        </motion.div>
      )}

      {isOnline && wasOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <Alert variant="success" className="rounded-none border-x-0 border-t-0" showIcon={false}>
            <div className="flex items-center justify-center gap-2">
              <Wifi className="h-5 w-5" aria-hidden="true" />
              <span className="font-medium">Conexão restaurada!</span>
            </div>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
