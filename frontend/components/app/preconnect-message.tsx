'use client';

import { AnimatePresence, motion } from 'motion/react';
import { type ReceivedChatMessage } from '@livekit/components-react';
import { ShimmerText } from '@/components/livekit/shimmer-text';
import { cn } from '@/lib/utils';
import { Phone, Sparkles, MessageCircle } from 'lucide-react';

const MotionMessage = motion.create('div');

const VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        ease: 'easeOut',
        duration: 0.5,
        delay: 0.8,
      },
    },
    hidden: {
      opacity: 0,
      y: 10,
      scale: 0.95,
      transition: {
        ease: 'easeIn',
        duration: 0.3,
        delay: 0,
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
    <AnimatePresence>
      {messages.length === 0 && (
        <MotionMessage
          {...VIEW_MOTION_PROPS}
          aria-hidden={messages.length > 0}
          className={cn('pointer-events-none text-center', className)}
        >
          {/* Main message card */}
          <div className="relative mx-auto max-w-md">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-emerald-500/20 to-blue-500/20 rounded-2xl blur-xl animate-pulse" />
            
            {/* Card content */}
            <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-blue-200 dark:border-blue-800 rounded-2xl shadow-xl px-6 py-4">
              {/* Icon row */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />
                  <div className="relative bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full p-2">
                    <Phone className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              </div>

              {/* Main text */}
              <ShimmerText className="text-base font-bold mb-2 bg-gradient-to-r from-slate-900 via-blue-700 to-emerald-700 dark:from-slate-100 dark:via-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
                Razorpay SDR is Ready
              </ShimmerText>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Ask me about payments, pricing, or features
              </p>

              {/* Quick prompts */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                {[
                  'Tell me about Razorpay',
                  'What are your fees?',
                  'How do I get started?',
                ].map((prompt, idx) => (
                  <motion.div
                    key={prompt}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + idx * 0.1 }}
                    className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>{prompt}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bottom hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400"
            >
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="font-medium">Voice active • Speak naturally</span>
            </motion.div>
          </div>
        </MotionMessage>
      )}
    </AnimatePresence>
  );
}