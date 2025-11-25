'use client';

import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { RoomContext } from '@livekit/components-react';
import { APP_CONFIG_DEFAULTS, type AppConfig } from '@/app-config';
import { useRoom } from '@/hooks/useRoom';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const SessionContext = createContext<{
  appConfig: AppConfig;
  isSessionActive: boolean;
  startSession: () => void;
  endSession: () => void;
  sessionStatus: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
}>({
  appConfig: APP_CONFIG_DEFAULTS,
  isSessionActive: false,
  startSession: () => {},
  endSession: () => {},
  sessionStatus: 'idle',
});

interface SessionProviderProps {
  appConfig: AppConfig;
  children: React.ReactNode;
}

// Connection status toast component
function ConnectionToast({ 
  status 
}: { 
  status: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error' 
}) {
  const statusConfig = {
    connecting: {
      icon: Loader2,
      text: 'Connecting to Razorpay SDR...',
      color: 'blue',
      animate: true,
    },
    connected: {
      icon: CheckCircle2,
      text: 'Connected! Ready to assist you',
      color: 'emerald',
      animate: false,
    },
    disconnected: {
      icon: XCircle,
      text: 'Session ended',
      color: 'slate',
      animate: false,
    },
    error: {
      icon: XCircle,
      text: 'Connection error. Please try again.',
      color: 'red',
      animate: false,
    },
  };

  if (status === 'idle') return null;

  const config = statusConfig[status];
  const Icon = config.icon;

  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[100]"
    >
      <div className={`
        flex items-center gap-3 px-5 py-3 rounded-full shadow-xl backdrop-blur-xl border-2
        ${colorClasses[config.color]}
      `}>
        <Icon 
          className={`w-5 h-5 ${config.animate ? 'animate-spin' : ''}`}
          strokeWidth={2.5}
        />
        <span className="font-semibold text-sm">
          {config.text}
        </span>
      </div>
    </motion.div>
  );
}

export const SessionProvider = ({ appConfig, children }: SessionProviderProps) => {
  const { room, isSessionActive, startSession, endSession } = useRoom(appConfig);
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'>('idle');

  // Track room connection state
  useEffect(() => {
    if (!room) return;

    const handleConnecting = () => {
      setSessionStatus('connecting');
    };

    const handleConnected = () => {
      setSessionStatus('connected');
      // Auto-hide the connected toast after 3 seconds
      setTimeout(() => {
        if (room.state === 'connected') {
          setSessionStatus('idle');
        }
      }, 3000);
    };

    const handleDisconnected = () => {
      setSessionStatus('disconnected');
      setTimeout(() => setSessionStatus('idle'), 2000);
    };

    const handleConnectionError = () => {
      setSessionStatus('error');
      setTimeout(() => setSessionStatus('idle'), 3000);
    };

    // Listen to room state changes
    room.on('connecting', handleConnecting);
    room.on('connected', handleConnected);
    room.on('disconnected', handleDisconnected);
    room.on('connectionStateChanged', (state) => {
      if (state === 'reconnecting') {
        setSessionStatus('connecting');
      }
    });

    // Cleanup
    return () => {
      room.off('connecting', handleConnecting);
      room.off('connected', handleConnected);
      room.off('disconnected', handleDisconnected);
    };
  }, [room]);

  const contextValue = useMemo(
    () => ({ 
      appConfig, 
      isSessionActive, 
      startSession, 
      endSession,
      sessionStatus,
    }),
    [appConfig, isSessionActive, startSession, endSession, sessionStatus]
  );

  return (
    <RoomContext.Provider value={room}>
      <SessionContext.Provider value={contextValue}>
        {children}
        
        {/* Connection status toast */}
        <AnimatePresence mode="wait">
          {sessionStatus !== 'idle' && (
            <ConnectionToast status={sessionStatus} />
          )}
        </AnimatePresence>
      </SessionContext.Provider>
    </RoomContext.Provider>
  );
};

export function useSession() {
  return useContext(SessionContext);
}