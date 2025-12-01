import React, { useState } from 'react';
import { Button } from '@/components/livekit/button';

function PulsingRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="absolute w-full h-full rounded-full border-2 border-cyan-500/20 animate-ping" style={{ animationDuration: '3s' }} />
      <div className="absolute w-[90%] h-[90%] rounded-full border-2 border-purple-500/20 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
      <div className="absolute w-[80%] h-[80%] rounded-full border-2 border-pink-500/20 animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }} />
    </div>
  );
}

function VinylIcon() {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mb-6 animate-[spin_8s_linear_infinite]"
    >
      <circle cx="50" cy="50" r="45" fill="url(#vinyl-gradient)" />
      <circle cx="50" cy="50" r="40" fill="#0a0a0a" opacity="0.3" />
      <circle cx="50" cy="50" r="35" fill="url(#vinyl-gradient-2)" />
      <circle cx="50" cy="50" r="25" fill="#0a0a0a" opacity="0.5" />
      <circle cx="50" cy="50" r="15" fill="url(#center-gradient)" />
      <circle cx="50" cy="50" r="8" fill="#0a0a0a" />
      <circle cx="50" cy="50" r="3" fill="#1a1a1a" />
      
      {[...Array(8)].map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="15"
          x2="50"
          y2="25"
          stroke="#ffffff"
          strokeWidth="0.5"
          opacity="0.15"
          transform={`rotate(${i * 45} 50 50)`}
        />
      ))}
      
      <defs>
        <linearGradient id="vinyl-gradient" x1="5" y1="5" x2="95" y2="95">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="vinyl-gradient-2" x1="15" y1="15" x2="85" y2="85">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <radialGradient id="center-gradient">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function FloatingParticle({ delay, duration, startX, startY }) {
  return (
    <div
      className="absolute w-1 h-1 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full opacity-60"
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
        animation: `float ${duration}s infinite ease-in-out`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

export const WelcomeView = React.forwardRef(({ startButtonText, onStartCall }, ref) => {
  const [name, setName] = useState('');
  const [started, setStarted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  async function handleStart() {
    setStarted(true);
    onStartCall?.(name.trim());
  }

  return (
    <div
      ref={ref}
      className="min-h-screen w-full flex items-center justify-center md:justify-end md:pr-32 lg:pr-44 bg-transparent relative overflow-hidden"
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.6; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.3; }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.3), 0 0 80px rgba(236, 72, 153, 0.2), inset 0 0 60px rgba(139, 92, 246, 0.1); }
          50% { box-shadow: 0 0 60px rgba(139, 92, 246, 0.5), 0 0 120px rgba(236, 72, 153, 0.3), inset 0 0 80px rgba(139, 92, 246, 0.2); }
        }
        @keyframes rotate-gradient {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .glow-circle {
          animation: glow-pulse 3s ease-in-out infinite;
        }
      `}</style>

      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <FloatingParticle
          key={i}
          delay={i * 0.3}
          duration={4 + (i % 3)}
          startX={10 + (i * 6)}
          startY={10 + ((i * 7) % 80)}
        />
      ))}

      {!started && (
        <div className="relative">
          {/* Outer rotating gradient ring */}
          <div className="absolute inset-0 -m-8 opacity-70">
            <div 
              className="w-full h-full rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 blur-2xl animate-[rotate-gradient_6s_linear_infinite]"
              style={{ transformOrigin: 'center' }}
            />
          </div>

          {/* Main circle container */}
          <div 
            className="relative w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] glow-circle border border-white/5 overflow-hidden"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <PulsingRings />
            
            {/* Gradient overlay animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-cyan-900/10 animate-pulse" />
            
            {/* Rotating light effect */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(139, 92, 246, 0.3), transparent)',
                animation: 'rotate-gradient 4s linear infinite'
              }}
            />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-12">
              
              {/* Floating emojis */}
              <div className={`absolute transition-all duration-700 ${isHovering ? 'top-8 opacity-100 rotate-12' : 'top-12 opacity-60 rotate-0'}`}>
                <span className="text-5xl drop-shadow-[0_0_20px_rgba(236,72,153,0.8)] select-none pointer-events-none">🎵</span>
              </div>
              <div className={`absolute transition-all duration-700 ${isHovering ? 'bottom-12 right-8 opacity-100 -rotate-12' : 'bottom-16 right-12 opacity-60 rotate-0'}`}>
                <span className="text-4xl drop-shadow-[0_0_20px_rgba(6,182,212,0.8)] select-none pointer-events-none">⚡</span>
              </div>
              <div className={`absolute transition-all duration-700 ${isHovering ? 'bottom-12 left-8 opacity-100 rotate-12' : 'bottom-16 left-12 opacity-60 rotate-0'}`}>
                <span className="text-3xl drop-shadow-[0_0_20px_rgba(251,191,36,0.8)] select-none pointer-events-none">🔥</span>
              </div>

              <VinylIcon />
              
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 mb-4 tracking-tight animate-pulse">
                DROP THE BEAT
              </h1>
              
              <p className="text-white/50 text-center font-semibold mb-12 text-sm uppercase tracking-widest">
                Enter the Arena
              </p>

              <div className="w-full max-w-sm space-y-5">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                    placeholder="Your alias..."
                    className="relative w-full px-7 py-4 bg-black/60 border border-white/10 rounded-full text-white placeholder:text-white/20 font-bold text-center text-lg focus:outline-none focus:border-purple-500/50 focus:bg-black/80 transition-all duration-300 backdrop-blur-xl shadow-[inset_0_2px_20px_rgba(0,0,0,0.8)]"
                  />
                </div>

                <Button
                  onClick={handleStart}
                  className="relative w-full py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-500 text-white font-black text-lg uppercase tracking-widest rounded-full shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:shadow-[0_0_50px_rgba(139,92,246,0.8)] transform hover:scale-105 transition-all duration-300 border-none overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative flex items-center justify-center gap-3">
                    <span className="text-2xl">🎯</span>
                    START BATTLE
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 group-hover:translate-x-1 transition-transform">
                      <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                  </span>
                </Button>
              </div>

              <div className="mt-8 flex items-center gap-3 text-white/30 text-xs font-mono uppercase tracking-widest">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
                Press Enter to Launch
              </div>
            </div>
          </div>
        </div>
      )}

      {started && (
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 blur-2xl rounded-full opacity-50 animate-ping" />
            <div className="relative text-8xl animate-bounce">💫</div>
          </div>
          <div className="text-white text-4xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent tracking-wider">
            LOADING ARENA...
          </div>
        </div>
      )}
    </div>
  );
});

WelcomeView.displayName = 'WelcomeView';