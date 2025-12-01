'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useLocalParticipant } from '@livekit/components-react';
import { ParticipantEvent, type LocalParticipant } from 'livekit-client';
import type { AppConfig } from '@/app-config';
import { ChatTranscript } from '@/components/app/chat-transcript';
import { PreConnectMessage } from '@/components/app/preconnect-message';
import { TileLayout } from '@/components/app/tile-layout';
import {
  AgentControlBar,
  type ControlBarControls,
} from '@/components/livekit/agent-control-bar/agent-control-bar';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useConnectionTimeout } from '@/hooks/useConnectionTimout';
import { useDebugMode } from '@/hooks/useDebug';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../livekit/scroll-area/scroll-area';

const MotionBottom = motion.create('div');

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const BOTTOM_VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      translateY: '0%',
    },
    hidden: {
      opacity: 0,
      translateY: '100%',
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.5,
    delay: 0.6,
    ease: [0.16, 1, 0.3, 1],
  },
};

interface FadeProps {
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export function Fade({ top = false, bottom = false, className }: FadeProps) {
  return (
    <div
      className={cn(
        'pointer-events-none h-8',
        top && 'bg-gradient-to-b from-black/40 via-black/20 to-transparent',
        bottom && 'bg-gradient-to-t from-black/40 via-black/20 to-transparent',
        className
      )}
    />
  );
}

// Floating particles for background
const FloatingParticle = ({ delay, duration, startX, startY, size }: any) => (
  <div
    className="absolute rounded-full bg-gradient-to-br from-cyan-400/20 to-purple-500/20 blur-sm"
    style={{
      left: `${startX}%`,
      top: `${startY}%`,
      width: `${size}px`,
      height: `${size}px`,
      animation: `float-particle ${duration}s infinite ease-in-out`,
      animationDelay: `${delay}s`,
    }}
  />
);

// Circular Player Badge
function PlayerBadge({ participant }: { participant?: LocalParticipant }) {
  const [displayName, setDisplayName] = useState('Sam');

  useEffect(() => {
    if (!participant) return;

    const updateName = () => {
      let name = participant.name || '';

      if ((!name || name === 'user' || name === 'identity') && participant.metadata) {
        try {
          const meta = JSON.parse(participant.metadata);
          if (meta.name) name = meta.name;
          if (meta.displayName) name = meta.displayName;
        } catch {}
      }

      const finalName = (name === 'user' || name === 'identity' || name.trim() === '') 
        ? 'Sam' 
        : name;
      
      setDisplayName(finalName);
    };

    updateName();

    participant.on(ParticipantEvent.NameChanged, updateName);
    participant.on(ParticipantEvent.MetadataChanged, updateName);

    return () => {
      participant.off(ParticipantEvent.NameChanged, updateName);
      participant.off(ParticipantEvent.MetadataChanged, updateName);
    };
  }, [participant]);

  return (
    <>
      <style>{`
        @keyframes glow-pulse-badge {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(236, 72, 153, 0.2); }
          50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(236, 72, 153, 0.4); }
        }
      `}</style>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ 
          type: 'spring',
          stiffness: 300,
          damping: 20,
          delay: 0.3 
        }}
        className="absolute top-6 left-6 z-40"
      >
        {/* Outer glow ring */}
        <div className="absolute inset-0 -m-2 rounded-full bg-gradient-to-br from-purple-600/30 via-pink-500/30 to-cyan-500/30 blur-xl animate-pulse" />
        
        {/* Main badge container */}
        <div 
          className="relative flex items-center gap-3 rounded-full bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] p-1.5 pr-6 backdrop-blur-xl border border-white/10"
          style={{ animation: 'glow-pulse-badge 3s ease-in-out infinite' }}
        >
          {/* Avatar circle with rotating gradient border */}
          <div className="relative">
            <div 
              className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 blur-sm"
              style={{ animation: 'spin 4s linear infinite' }}
            />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-white/20 shadow-lg">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="size-6 text-purple-900"
              >
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Name display */}
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 tracking-widest">
              Player
            </span>
            <span className="text-base font-black text-white leading-none tracking-wide drop-shadow-lg">
              {displayName}
            </span>
          </div>

          {/* Status dot */}
          <div className="absolute -top-1 -right-1">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-full blur-sm animate-pulse" />
              <div className="relative w-3 h-3 rounded-full bg-green-400 border-2 border-black" />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

interface SessionViewProps {
  appConfig: AppConfig;
}

export const SessionView = ({
  appConfig,
  ...props
}: React.ComponentProps<'section'> & SessionViewProps) => {
  useConnectionTimeout(200_000);
  useDebugMode({ enabled: IN_DEVELOPMENT });

  const { localParticipant } = useLocalParticipant();
  
  const messages = useChatMessages();
  const [chatOpen, setChatOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const controls: ControlBarControls = {
    leave: true,
    microphone: true,
    chat: appConfig.supportsChatInput,
    camera: appConfig.supportsVideoInput,
    screenShare: appConfig.supportsVideoInput,
  };

  useEffect(() => {
    const lastMessage = messages.at(-1);
    const lastMessageIsLocal = lastMessage?.from?.isLocal === true;

    if (scrollAreaRef.current && lastMessageIsLocal) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <section
      className="relative z-10 h-full w-full overflow-hidden"
      {...props}
    >
      <style>{`
        @keyframes float-particle {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.4;
          }
          33% { 
            transform: translateY(-30px) translateX(20px) scale(1.2);
            opacity: 0.2;
          }
          66% { 
            transform: translateY(-15px) translateX(-15px) scale(0.8);
            opacity: 0.3;
          }
        }
        @keyframes rotate-gradient-bg {
          0% { transform: rotate(0deg) scale(1.5); }
          100% { transform: rotate(360deg) scale(1.5); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Dark Gradient Background with animated overlay */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 select-none overflow-hidden bg-black">
        {/* Base dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]" />
        
        {/* Rotating gradient overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'conic-gradient(from 0deg at 50% 50%, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2), rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2))',
            animation: 'rotate-gradient-bg 20s linear infinite',
          }}
        />

        {/* Radial glow spots */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 0.4}
            duration={5 + (i % 4)}
            startX={5 + (i * 5)}
            startY={10 + ((i * 7) % 80)}
            size={3 + (i % 4)}
          />
        ))}

        {/* Subtle grid overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Player Badge */}
      <PlayerBadge participant={localParticipant} />

      {/* Chat Transcript */}
      <div
        className={cn(
          'fixed inset-0 grid grid-cols-1 grid-rows-1',
          !chatOpen && 'pointer-events-none'
        )}
      >
        <Fade top className="absolute inset-x-4 top-0 h-48" />
        
        <ScrollArea ref={scrollAreaRef} className="px-4 pt-48 pb-[160px] md:px-6 md:pb-[200px]">
          <ChatTranscript
            hidden={!chatOpen}
            messages={messages}
            className="ml-auto mr-0 md:mr-12 max-w-lg space-y-4 transition-all duration-500 ease-out"
          />
        </ScrollArea>
      </div>

      {/* Tile Layout (Agent Visuals) */}
      <TileLayout chatOpen={chatOpen} />

      {/* Bottom Controls */}
      <MotionBottom
        {...BOTTOM_VIEW_MOTION_PROPS}
        className="fixed inset-x-3 bottom-0 z-50 md:inset-x-12"
      >
        {appConfig.isPreConnectBufferEnabled && (
          <PreConnectMessage messages={messages} className="pb-4" />
        )}
        
        <div className="relative ml-auto mr-0 md:mr-4 max-w-lg pb-4 md:pb-16">
          <Fade bottom className="absolute inset-x-0 top-0 h-6 -translate-y-full" />
          <AgentControlBar controls={controls} onChatOpenChange={setChatOpen} />
        </div>
      </MotionBottom>
    </section>
  );
};