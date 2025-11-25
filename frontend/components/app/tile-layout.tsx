import React, { useMemo } from 'react';
import { Track } from 'livekit-client';
import { AnimatePresence, motion } from 'motion/react';
import {
  BarVisualizer,
  type TrackReference,
  VideoTrack,
  useLocalParticipant,
  useTracks,
  useVoiceAssistant,
} from '@livekit/components-react';
import { cn } from '@/lib/utils';
import { Briefcase, Phone, TrendingUp } from 'lucide-react';

const MotionContainer = motion.create('div');

const ANIMATION_TRANSITION = {
  type: 'spring',
  stiffness: 675,
  damping: 75,
  mass: 1,
};

const classNames = {
  // GRID
  // 2 Columns x 3 Rows
  grid: [
    'h-full w-full',
    'grid gap-x-2 place-content-center',
    'grid-cols-[1fr_1fr] grid-rows-[90px_1fr_90px]',
  ],
  // Agent
  // chatOpen: true,
  // hasSecondTile: true
  // layout: Column 1 / Row 1
  // align: x-end y-center
  agentChatOpenWithSecondTile: ['col-start-1 row-start-1', 'self-center justify-self-end'],
  // Agent
  // chatOpen: true,
  // hasSecondTile: false
  // layout: Column 1 / Row 1 / Column-Span 2
  // align: x-center y-center
  agentChatOpenWithoutSecondTile: ['col-start-1 row-start-1', 'col-span-2', 'place-content-center'],
  // Agent
  // chatOpen: false
  // layout: Column 1 / Row 1 / Column-Span 2 / Row-Span 3
  // align: x-center y-center
  agentChatClosed: ['col-start-1 row-start-1', 'col-span-2 row-span-3', 'place-content-center'],
  // Second tile
  // chatOpen: true,
  // hasSecondTile: true
  // layout: Column 2 / Row 1
  // align: x-start y-center
  secondTileChatOpen: ['col-start-2 row-start-1', 'self-center justify-self-start'],
  // Second tile
  // chatOpen: false,
  // hasSecondTile: false
  // layout: Column 2 / Row 2
  // align: x-end y-end
  secondTileChatClosed: ['col-start-2 row-start-3', 'place-content-end'],
};

export function useLocalTrackRef(source: Track.Source) {
  const { localParticipant } = useLocalParticipant();
  const publication = localParticipant.getTrackPublication(source);
  const trackRef = useMemo<TrackReference | undefined>(
    () => (publication ? { source, participant: localParticipant, publication } : undefined),
    [source, publication, localParticipant]
  );
  return trackRef;
}

interface TileLayoutProps {
  chatOpen: boolean;
}

export function TileLayout({ chatOpen }: TileLayoutProps) {
  const {
    state: agentState,
    audioTrack: agentAudioTrack,
    videoTrack: agentVideoTrack,
  } = useVoiceAssistant();
  const [screenShareTrack] = useTracks([Track.Source.ScreenShare]);
  const cameraTrack: TrackReference | undefined = useLocalTrackRef(Track.Source.Camera);

  const isCameraEnabled = cameraTrack && !cameraTrack.publication.isMuted;
  const isScreenShareEnabled = screenShareTrack && !screenShareTrack.publication.isMuted;
  const hasSecondTile = isCameraEnabled || isScreenShareEnabled;

  const animationDelay = chatOpen ? 0 : 0.15;
  const isAvatar = agentVideoTrack !== undefined;
  const videoWidth = agentVideoTrack?.publication.dimensions?.width ?? 0;
  const videoHeight = agentVideoTrack?.publication.dimensions?.height ?? 0;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-8 bottom-32 z-50 md:top-12 md:bottom-40">
      <div className="relative mx-auto h-full max-w-2xl px-4 md:px-0">
        <div className={cn(classNames.grid)}>
          {/* Agent */}
          <div
            className={cn([
              'grid',
              !chatOpen && classNames.agentChatClosed,
              chatOpen && hasSecondTile && classNames.agentChatOpenWithSecondTile,
              chatOpen && !hasSecondTile && classNames.agentChatOpenWithoutSecondTile,
            ])}
          >
            <AnimatePresence mode="popLayout">
              {!isAvatar && (
                // Audio Agent - Enhanced SDR Version
                <MotionContainer
                  key="agent"
                  layoutId="agent"
                  initial={{
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    opacity: 1,
                    scale: chatOpen ? 1 : 5,
                  }}
                  transition={{
                    ...ANIMATION_TRANSITION,
                    delay: animationDelay,
                  }}
                  className={cn(
                    'relative aspect-square h-[90px] rounded-2xl border-2 transition-all duration-300',
                    chatOpen 
                      ? 'border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-950/50 dark:to-emerald-950/50 drop-shadow-xl' 
                      : 'border-blue-300 dark:border-blue-700 bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-950/50 drop-shadow-2xl'
                  )}
                >
                  {/* Background icon when not speaking */}
                  {agentState !== 'speaking' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full blur-md opacity-30 animate-pulse" />
                        <div className="relative bg-gradient-to-br from-blue-600 to-emerald-600 rounded-full p-3">
                          <Briefcase className="w-8 h-8 text-white" strokeWidth={2} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Visualizer overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BarVisualizer
                      barCount={5}
                      state={agentState}
                      options={{ minHeight: 5 }}
                      trackRef={agentAudioTrack}
                      className={cn('flex h-full items-center justify-center gap-1.5')}
                    >
                      <span
                        className={cn([
                          'min-h-3 w-3 rounded-full',
                          'origin-center transition-all duration-300 ease-out',
                          'data-[lk-highlighted=true]:bg-gradient-to-t data-[lk-highlighted=true]:from-blue-500 data-[lk-highlighted=true]:to-emerald-500',
                          'data-[lk-highlighted=true]:shadow-lg data-[lk-highlighted=true]:shadow-blue-500/50',
                          'data-[lk-highlighted=false]:bg-slate-300 dark:data-[lk-highlighted=false]:bg-slate-700',
                          'data-[lk-muted=true]:bg-slate-200 dark:data-[lk-muted=true]:bg-slate-800',
                        ])}
                      />
                    </BarVisualizer>
                  </div>

                  {/* Decorative rings when speaking */}
                  {agentState === 'speaking' && (
                    <>
                      <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/50 animate-ping" style={{ animationDuration: '2s' }} />
                      <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400/50 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.3s' }} />
                    </>
                  )}

                  {/* Status badge */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10">
                    <div className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm border transition-all duration-300',
                      agentState === 'speaking' 
                        ? 'bg-emerald-100/90 dark:bg-emerald-900/90 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                        : agentState === 'listening'
                        ? 'bg-blue-100/90 dark:bg-blue-900/90 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                        : 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                    )}>
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        agentState === 'speaking' && 'bg-emerald-500 animate-pulse',
                        agentState === 'listening' && 'bg-blue-500 animate-pulse',
                        agentState === 'thinking' && 'bg-amber-500 animate-pulse',
                      )} />
                      <span className="capitalize">{agentState}</span>
                    </div>
                  </div>
                </MotionContainer>
              )}

              {isAvatar && (
                // Avatar Agent - Enhanced with gradient border
                <MotionContainer
                  key="avatar"
                  layoutId="avatar"
                  initial={{
                    scale: 1,
                    opacity: 1,
                    maskImage:
                      'radial-gradient(circle, rgba(0, 0, 0, 1) 0, rgba(0, 0, 0, 1) 20px, transparent 20px)',
                    filter: 'blur(20px)',
                  }}
                  animate={{
                    maskImage:
                      'radial-gradient(circle, rgba(0, 0, 0, 1) 0, rgba(0, 0, 0, 1) 500px, transparent 500px)',
                    filter: 'blur(0px)',
                    borderRadius: chatOpen ? 12 : 16,
                  }}
                  transition={{
                    ...ANIMATION_TRANSITION,
                    delay: animationDelay,
                    maskImage: {
                      duration: 1,
                    },
                    filter: {
                      duration: 1,
                    },
                  }}
                  className={cn(
                    'relative overflow-hidden bg-black drop-shadow-2xl',
                    'ring-2 ring-blue-400/50 dark:ring-blue-600/50',
                    chatOpen ? 'h-[90px]' : 'h-auto w-full'
                  )}
                >
                  <VideoTrack
                    width={videoWidth}
                    height={videoHeight}
                    trackRef={agentVideoTrack}
                    className={cn(chatOpen && 'size-[90px] object-cover')}
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </MotionContainer>
              )}
            </AnimatePresence>
          </div>

          <div
            className={cn([
              'grid',
              chatOpen && classNames.secondTileChatOpen,
              !chatOpen && classNames.secondTileChatClosed,
            ])}
          >
            {/* Camera & Screen Share - Enhanced styling */}
            <AnimatePresence>
              {((cameraTrack && isCameraEnabled) || (screenShareTrack && isScreenShareEnabled)) && (
                <MotionContainer
                  key="camera"
                  layout="position"
                  layoutId="camera"
                  initial={{
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{
                    ...ANIMATION_TRANSITION,
                    delay: animationDelay,
                  }}
                  className="drop-shadow-2xl"
                >
                  <div className="relative">
                    <VideoTrack
                      trackRef={cameraTrack || screenShareTrack}
                      width={(cameraTrack || screenShareTrack)?.publication.dimensions?.width ?? 0}
                      height={(cameraTrack || screenShareTrack)?.publication.dimensions?.height ?? 0}
                      className="bg-slate-900 dark:bg-slate-950 aspect-square w-[90px] rounded-2xl object-cover ring-2 ring-slate-300 dark:ring-slate-700"
                    />
                    
                    {/* Label */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm border bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700">
                        {screenShareTrack ? 'Screen' : 'You'}
                      </div>
                    </div>
                  </div>
                </MotionContainer>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}