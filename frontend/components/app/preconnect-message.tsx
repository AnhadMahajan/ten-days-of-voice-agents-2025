'use client';

import { AnimatePresence, motion } from 'motion/react';
import { type ReceivedChatMessage } from '@livekit/components-react';
import { ShimmerText } from '@/components/livekit/shimmer-text';
import { cn } from '@/lib/utils';

const MotionMessage = motion.create('div');

const VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: 0.8,
      },
    },
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: {
        ease: 'easeOut',
        duration: 0.3,
      },
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
};

interface PreConnectMessageProps {
  messages?: ReceivedChatMessage[];
  className?: string;
}

export function PreConnectMessage({ className, messages = [] }: PreConnectMessageProps) {
  return (
    <>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.4), 0 0 60px rgba(236, 72, 153, 0.3), inset 0 0 30px rgba(139, 92, 246, 0.1);
          }
          50% { 
            box-shadow: 0 0 50px rgba(139, 92, 246, 0.6), 0 0 100px rgba(236, 72, 153, 0.5), inset 0 0 50px rgba(139, 92, 246, 0.2);
          }
        }
        @keyframes rotate-border {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float-icon {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes ping-dot {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>

      <AnimatePresence>
        {messages.length === 0 && (
          <MotionMessage
            {...VIEW_MOTION_PROPS}
            aria-hidden={messages.length > 0}
            className={cn('pointer-events-none flex justify-center', className)}
          >
            <div className="relative">
              {/* Outer rotating gradient ring */}
              <div 
                className="absolute inset-0 -m-4 opacity-60 pointer-events-none"
                style={{ animation: 'rotate-border 6s linear infinite' }}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 blur-xl" />
              </div>

              {/* Main container */}
              <div 
                className="relative rounded-full bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] border border-white/10 px-8 py-4 backdrop-blur-xl overflow-visible"
                style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
              >
                {/* Pulsing rings background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-full">
                  <div 
                    className="absolute w-[90%] h-[90%] rounded-full border border-purple-500/20 animate-ping"
                    style={{ animationDuration: '3s' }}
                  />
                  <div 
                    className="absolute w-[70%] h-[70%] rounded-full border border-pink-500/20 animate-ping"
                    style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
                  />
                </div>

                {/* Rotating gradient overlay */}
                <div 
                  className="absolute inset-0 opacity-20 pointer-events-none rounded-full"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent, rgba(139, 92, 246, 0.4), transparent)',
                    animation: 'rotate-border 4s linear infinite'
                  }}
                />

                {/* Content */}
                <div className="relative z-10 flex items-center gap-4">
                  {/* Animated microphone icon */}
                  <div 
                    className="relative"
                    style={{ animation: 'float-icon 3s ease-in-out infinite' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-lg" />
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 border border-white/20 shadow-lg">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="currentColor" 
                        className="w-5 h-5 text-white"
                      >
                        <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                        <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                      </svg>
                    </div>
                    
                    {/* Recording dot indicator */}
                    <div className="absolute -top-1 -right-1">
                      <div className="relative">
                        <div 
                          className="absolute inset-0 w-3 h-3 rounded-full bg-red-500"
                          style={{ animation: 'ping-dot 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}
                        />
                        <div className="relative w-3 h-3 rounded-full bg-red-500 border-2 border-black shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                      </div>
                    </div>
                  </div>

                  {/* Text content */}
                  <div className="flex flex-col">
                    <ShimmerText className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 whitespace-nowrap">
                      Host is listening
                    </ShimmerText>
                    <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                      Show your talent
                    </span>
                  </div>

                  {/* Audio wave animation */}
                  <div className="flex items-center gap-0.5 ml-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-0.5 rounded-full bg-gradient-to-t from-cyan-400 to-purple-400"
                        style={{
                          height: `${12 + Math.random() * 12}px`,
                          animation: `pulse-wave 1s ease-in-out infinite`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Decorative sparkles */}
              <div className="absolute -top-2 -right-2 text-2xl opacity-80 animate-pulse pointer-events-none select-none" style={{ animationDuration: '2s' }}>
                ✨
              </div>
              <div className="absolute -bottom-1 -left-2 text-xl opacity-80 animate-pulse pointer-events-none select-none" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
                🎤
              </div>
            </div>
          </MotionMessage>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse-wave {
          0%, 100% { 
            transform: scaleY(0.5);
            opacity: 0.5;
          }
          50% { 
            transform: scaleY(1.5);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}