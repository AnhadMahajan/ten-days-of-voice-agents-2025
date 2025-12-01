'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { Track } from 'livekit-client';
import { AnimatePresence, motion } from 'motion/react';
import {
  type TrackReference,
  VideoTrack,
  useLocalParticipant,
  useTracks,
  useVoiceAssistant,
} from '@livekit/components-react';
import { cn } from '@/lib/utils';

const MotionContainer = motion.create('div');

const ANIMATION_TRANSITION = {
  type: 'spring',
  stiffness: 600,
  damping: 40,
  mass: 0.8,
};

const classNames = {
  grid: [
    'h-full w-full',
    'grid gap-x-4 place-content-center',
    'grid-cols-[1fr_1fr] grid-rows-[120px_1fr_120px]',
  ],
  agentChatOpenWithSecondTile: ['col-start-1 row-start-1', 'self-center justify-self-end'],
  agentChatOpenWithoutSecondTile: ['col-start-1 row-start-1', 'col-span-2', 'place-content-center'],
  agentChatClosed: ['col-start-1 row-start-1', 'col-span-2 row-span-3', 'place-content-center'],
  secondTileChatOpen: ['col-start-2 row-start-1', 'self-center justify-self-start'],
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

/**
 * Circular Audio Visualizer with Pulsing Rings
 */
const CircularVisualizer = ({
  trackRef,
  className,
  isMinimized = false,
}: {
  trackRef?: TrackReference;
  className?: string;
  isMinimized?: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !trackRef?.publication?.track) return;

    const track = trackRef.publication.track;
    if (!track.mediaStreamTrack) return;

    const stream = new MediaStream([track.mediaStreamTrack]);
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.85;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let animationId: number;
    let rotation = 0;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 20;

      ctx.clearRect(0, 0, width, height);

      // Rotating background gradient
      rotation += 0.005;
      const gradient = ctx.createLinearGradient(
        centerX + Math.cos(rotation) * radius,
        centerY + Math.sin(rotation) * radius,
        centerX - Math.cos(rotation) * radius,
        centerY - Math.sin(rotation) * radius
      );
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.03)');
      gradient.addColorStop(0.5, 'rgba(236, 72, 153, 0.03)');
      gradient.addColorStop(1, 'rgba(6, 182, 212, 0.03)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw circular bars
      const barCount = isMinimized ? 40 : 80;
      const barWidth = (Math.PI * 2) / barCount;
      
      for (let i = 0; i < barCount; i++) {
        const index = Math.floor((i / barCount) * bufferLength);
        const value = dataArray[index];
        const percent = value / 255;
        const barHeight = (radius * 0.6) * percent;
        
        const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;
        const x1 = centerX + Math.cos(angle) * (radius - barHeight);
        const y1 = centerY + Math.sin(angle) * (radius - barHeight);
        const x2 = centerX + Math.cos(angle) * radius;
        const y2 = centerY + Math.sin(angle) * radius;

        // Gradient for each bar
        const barGradient = ctx.createLinearGradient(x1, y1, x2, y2);
        const hue = (i / barCount) * 360;
        barGradient.addColorStop(0, `hsla(${hue}, 70%, 60%, 0.2)`);
        barGradient.addColorStop(1, `hsla(${hue}, 80%, 70%, 0.9)`);

        ctx.strokeStyle = barGradient;
        ctx.lineWidth = isMinimized ? 2 : 3;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsla(${hue}, 80%, 60%, 0.5)`;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Pulsing center circle
      const avgVolume = dataArray.reduce((a, b) => a + b, 0) / bufferLength / 255;
      const pulseRadius = 15 + avgVolume * 20;

      const centerGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, pulseRadius
      );
      centerGradient.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
      centerGradient.addColorStop(0.6, 'rgba(236, 72, 153, 0.4)');
      centerGradient.addColorStop(1, 'rgba(139, 92, 246, 0.1)');

      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
      ctx.fillStyle = centerGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Inner ring
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
      ctx.stroke();
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      source.disconnect();
      analyser.disconnect();
      audioContext.close();
    };
  }, [trackRef, isMinimized]);

  return <canvas ref={canvasRef} className={className} width={400} height={400} />;
};

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

  const animationDelay = chatOpen ? 0 : 0.2;
  const isAvatar = agentVideoTrack !== undefined;
  const videoWidth = agentVideoTrack?.publication.dimensions?.width ?? 0;
  const videoHeight = agentVideoTrack?.publication.dimensions?.height ?? 0;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-8 bottom-32 z-50 md:top-12 md:bottom-40">
      <style>{`
        @keyframes rotate-glow {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        @keyframes pulse-ring {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.6;
          }
          50% { 
            transform: scale(1.05);
            opacity: 0.8;
          }
        }
      `}</style>
      
      <div className="relative mx-auto h-full max-w-4xl px-4 md:px-0">
        <div className={cn(classNames.grid)}>
          {/* Agent */}
          <div
            className={cn([
              'grid transition-all duration-700 ease-out',
              !chatOpen && classNames.agentChatClosed,
              chatOpen && hasSecondTile && classNames.agentChatOpenWithSecondTile,
              chatOpen && !hasSecondTile && classNames.agentChatOpenWithoutSecondTile,
            ])}
          >
            <AnimatePresence mode="popLayout">
              {!isAvatar && (
                // Audio Agent - Circular Visualizer
                <MotionContainer
                  key="agent"
                  layoutId="agent"
                  initial={{ opacity: 0, scale: 0.5, rotate: -180, filter: 'blur(20px)' }}
                  animate={{ 
                    opacity: 1, 
                    scale: chatOpen ? 0.35 : 1, 
                    rotate: 0,
                    filter: 'blur(0px)'
                  }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 180, filter: 'blur(20px)' }}
                  transition={{ ...ANIMATION_TRANSITION, delay: animationDelay }}
                  className="relative"
                >
                  {/* Outer rotating glow ring */}
                  <div 
                    className={cn(
                      'absolute inset-0 rounded-full blur-xl opacity-40 transition-all duration-700',
                      chatOpen ? 'scale-110' : 'scale-125'
                    )}
                    style={{
                      background: 'conic-gradient(from 0deg, #8b5cf6, #ec4899, #06b6d4, #8b5cf6)',
                      animation: 'rotate-glow 6s linear infinite'
                    }}
                  />
                  
                  {/* Main container */}
                  <div
                    className={cn(
                      'relative overflow-hidden rounded-full',
                      'bg-gradient-to-br from-black via-[#0a0a0a] to-black',
                      'border shadow-2xl transition-all duration-700',
                      chatOpen 
                        ? 'h-[120px] w-[120px] border-purple-500/20 shadow-[0_0_40px_rgba(139,92,246,0.3)]' 
                        : 'h-[400px] w-[400px] border-purple-500/30 shadow-[0_0_80px_rgba(139,92,246,0.4)]'
                    )}
                    style={{ animation: 'pulse-ring 3s ease-in-out infinite' }}
                  >
                    {/* Pulsing rings background */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div 
                        className="absolute rounded-full border-2 border-cyan-500/10 animate-ping"
                        style={{ 
                          width: '90%', 
                          height: '90%',
                          animationDuration: '3s' 
                        }} 
                      />
                      <div 
                        className="absolute rounded-full border-2 border-purple-500/10 animate-ping"
                        style={{ 
                          width: '75%', 
                          height: '75%',
                          animationDuration: '2.5s',
                          animationDelay: '0.5s'
                        }} 
                      />
                      <div 
                        className="absolute rounded-full border-2 border-pink-500/10 animate-ping"
                        style={{ 
                          width: '60%', 
                          height: '60%',
                          animationDuration: '2s',
                          animationDelay: '1s'
                        }} 
                      />
                    </div>

                    {/* Visualizer */}
                    <CircularVisualizer
                      trackRef={agentAudioTrack}
                      className="relative z-10 h-full w-full"
                      isMinimized={chatOpen}
                    />
                  </div>
                </MotionContainer>
              )}

              {isAvatar && (
                // Avatar Agent - Circular video
                <MotionContainer
                  key="avatar"
                  layoutId="avatar"
                  initial={{
                    scale: 0.8,
                    opacity: 0,
                    rotate: -90,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    rotate: 0,
                  }}
                  exit={{
                    scale: 0.8,
                    opacity: 0,
                    rotate: 90,
                  }}
                  transition={{
                    ...ANIMATION_TRANSITION,
                    delay: animationDelay,
                  }}
                  className="relative"
                >
                  {/* Outer glow */}
                  <div 
                    className={cn(
                      'absolute inset-0 rounded-full blur-2xl opacity-50',
                      chatOpen ? 'scale-110' : 'scale-125'
                    )}
                    style={{
                      background: 'radial-gradient(circle, rgba(139,92,246,0.4), rgba(236,72,153,0.3), transparent)',
                    }}
                  />

                  <div
                    className={cn(
                      'relative overflow-hidden rounded-full',
                      'bg-black border border-purple-500/30',
                      'shadow-[0_0_60px_rgba(139,92,246,0.4)]',
                      chatOpen 
                        ? 'h-[120px] w-[120px]' 
                        : 'h-[400px] w-[400px]'
                    )}
                  >
                    <VideoTrack
                      width={videoWidth}
                      height={videoHeight}
                      trackRef={agentVideoTrack}
                      className="h-full w-full object-cover scale-110"
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20 pointer-events-none" />
                  </div>
                </MotionContainer>
              )}
            </AnimatePresence>
          </div>

          <div
            className={cn([
              'grid transition-all duration-700',
              chatOpen && classNames.secondTileChatOpen,
              !chatOpen && classNames.secondTileChatClosed,
            ])}
          >
            {/* Camera & Screen Share */}
            <AnimatePresence>
              {(cameraTrack && isCameraEnabled || screenShareTrack && isScreenShareEnabled) && (
                <MotionContainer
                  key="camera"
                  layout="position"
                  layoutId="camera"
                  initial={{ opacity: 0, scale: 0.6, y: 30, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.6, y: 30, rotate: 45 }}
                  transition={{ ...ANIMATION_TRANSITION, delay: animationDelay }}
                  className="relative"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 blur-xl scale-110" />
                  
                  <div
                    className={cn(
                      'relative overflow-hidden rounded-full',
                      'shadow-lg border border-cyan-500/30',
                      'bg-black/90',
                      'h-[120px] w-[120px]',
                      'shadow-[0_0_30px_rgba(6,182,212,0.3)]'
                    )}
                  >
                    <VideoTrack
                      trackRef={cameraTrack || screenShareTrack}
                      width={(cameraTrack || screenShareTrack)?.publication.dimensions?.width ?? 0}
                      height={(cameraTrack || screenShareTrack)?.publication.dimensions?.height ?? 0}
                      className="h-full w-full object-cover scale-110"
                    />
                    
                    {/* Status indicator */}
                    <div className="absolute bottom-2 right-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-cyan-400 rounded-full blur-sm animate-pulse" />
                        <div className="relative h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]" />
                      </div>
                    </div>

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-purple-900/10 pointer-events-none" />
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