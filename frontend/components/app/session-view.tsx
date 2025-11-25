'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
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
import { Phone, Briefcase, TrendingUp } from 'lucide-react';

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
    duration: 0.3,
    delay: 0.5,
    ease: 'easeOut',
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
        'from-background pointer-events-none h-4 bg-linear-to-b to-transparent',
        top && 'bg-linear-to-b',
        bottom && 'bg-linear-to-t',
        className
      )}
    />
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
    <section className="relative z-10 h-full w-full overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50/20 to-slate-50 dark:from-slate-950 dark:via-blue-950/10 dark:to-slate-950" {...props}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-400/10 dark:bg-emerald-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '1s' }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      {/* Status Banner */}
      <div className="fixed top-16 left-0 right-0 z-40 pointer-events-none">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mx-auto max-w-2xl"
          >
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-blue-200 dark:border-blue-800 rounded-2xl shadow-lg px-6 py-4 pointer-events-auto">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />
                    <div className="relative bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full p-2">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Connected to Razorpay SDR
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Ask me anything about our payment solutions
                    </p>
                  </div>
                </div>
                
                {/* Live indicator */}
                <div className="hidden md:flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full text-xs font-semibold">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span>LIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Chat Transcript */}
      <div
        className={cn(
          'fixed inset-0 grid grid-cols-1 grid-rows-1 pt-32',
          !chatOpen && 'pointer-events-none'
        )}
      >
        <Fade top className="absolute inset-x-4 top-32 h-40 z-10" />
        <ScrollArea ref={scrollAreaRef} className="px-4 pt-40 pb-[150px] md:px-6 md:pb-[180px]">
          <ChatTranscript
            hidden={!chatOpen}
            messages={messages}
            className="mx-auto max-w-2xl space-y-3 transition-opacity duration-300 ease-out"
          />
        </ScrollArea>
      </div>

      {/* Tile Layout */}
      <TileLayout chatOpen={chatOpen} />

      {/* Floating Info Cards */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="fixed left-6 bottom-32 z-30 hidden xl:block"
      >
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 max-w-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Session</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Lead Qualification</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Product Interest</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Payment Gateway</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Conversation Stage</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Discovery</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="fixed right-6 bottom-32 z-30 hidden xl:block"
      >
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 max-w-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-2">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quick Stats</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Razorpay Highlights</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Transaction Fee</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Setup Time</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">2 mins</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Payment Methods</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">100+</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Controls */}
      <MotionBottom
        {...BOTTOM_VIEW_MOTION_PROPS}
        className="fixed inset-x-3 bottom-0 z-50 md:inset-x-12"
      >
        {appConfig.isPreConnectBufferEnabled && (
          <PreConnectMessage messages={messages} className="pb-4" />
        )}
        <div className="relative mx-auto max-w-2xl pb-3 md:pb-12">
          {/* Enhanced background for control bar */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white to-transparent dark:from-slate-950 dark:via-slate-950 dark:to-transparent blur-xl" />
          <Fade bottom className="absolute inset-x-0 top-0 h-4 -translate-y-full" />
          
          {/* Control bar container with enhanced styling */}
          <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl p-2">
            <AgentControlBar controls={controls} onChatOpenChange={setChatOpen} />
          </div>
        </div>
      </MotionBottom>
    </section>
  );
};