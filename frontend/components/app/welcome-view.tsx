import { Button } from '@/components/livekit/button';
import { Anchor, Sparkles, Waves, Skull, Compass, Flag } from 'lucide-react';

function PirateIcon() {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full"></div>
      <div className="relative bg-gradient-to-br from-orange-600 to-red-800 p-6 rounded-2xl shadow-2xl">
        <Anchor className="w-16 h-16 text-white" strokeWidth={1.5} />
      </div>
    </div>
  );
}

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div ref={ref} className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-orange-950">
      <section className="flex flex-col items-center justify-center text-center px-4 py-12 min-h-screen">
        <PirateIcon />

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Grand Line Adventures
        </h1>
        
        <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <Sparkles className="w-5 h-5 text-orange-400" />
          <span className="text-orange-300 font-semibold text-sm md:text-base">
            Voice Game Master
          </span>
        </div>

        <p className="text-slate-300 max-w-md text-base md:text-lg leading-relaxed mb-2">
          Embark on an epic One Piece adventure guided by your AI Game Master
        </p>
        
        <p className="text-slate-400 max-w-lg text-sm md:text-base leading-relaxed mb-8">
          Set sail on the Grand Line! Make choices through voice, meet legendary pirates, 
          discover Devil Fruits, and chase your dreams on the open sea!
        </p>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-8 max-w-md">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Flag className="w-5 h-5 text-orange-400" />
            How It Works:
          </h3>
          <ul className="text-left text-slate-300 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-orange-400 font-bold">1.</span>
              <span>The Game Master describes your adventure scene</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 font-bold">2.</span>
              <span>You make decisions by speaking your choices</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 font-bold">3.</span>
              <span>The story adapts to your actions dynamically</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 font-bold">4.</span>
              <span>Experience a unique pirate adventure every time!</span>
            </li>
          </ul>
        </div>

        <Button 
          variant="primary" 
          size="lg" 
          onClick={onStartCall} 
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3"
        >
          <Anchor className="w-5 h-5" />
          {startButtonText}
        </Button>

        <div className="mt-6 flex items-center gap-2 text-slate-500 text-xs">
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Voice Adventure</span>
        </div>

        {/* Adventure Modes */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-5 h-5 text-orange-400" />
              <h4 className="text-orange-300 font-semibold text-sm">Grand Line</h4>
            </div>
            <p className="text-slate-400 text-xs">
              Navigate treacherous waters and discover mysterious islands
            </p>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-red-400" />
              <h4 className="text-red-300 font-semibold text-sm">Devil Fruit Hunt</h4>
            </div>
            <p className="text-slate-400 text-xs">
              Search for legendary Devil Fruits and unlock incredible powers
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Skull className="w-5 h-5 text-blue-400" />
              <h4 className="text-blue-300 font-semibold text-sm">Marine Showdown</h4>
            </div>
            <p className="text-slate-400 text-xs">
              Face off against the Navy in epic pirate battles
            </p>
          </div>
        </div>

        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 max-w-md">
          <p className="text-blue-300 text-xs md:text-sm font-medium mb-2">
            ⚓ Captain's Log
          </p>
          <p className="text-blue-200/80 text-xs leading-relaxed">
            Try saying <strong>"I want to explore the Grand Line"</strong> or{' '}
            <strong>"What adventures await me, Game Master?"</strong>
          </p>
        </div>

        {/* Pirate Flag Elements */}
        <div className="mt-8 flex items-center gap-6 text-slate-600">
          <Waves className="w-6 h-6" />
          <Skull className="w-6 h-6" />
          <Anchor className="w-6 h-6" />
          <Flag className="w-6 h-6" />
          <Compass className="w-6 h-6" />
        </div>

        <p className="mt-4 text-slate-500 text-xs italic">
          "I'm gonna be King of the Pirates!" - Monkey D. Luffy
        </p>
      </section>
    </div>
  );
}