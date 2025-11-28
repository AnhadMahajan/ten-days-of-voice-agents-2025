import { Button } from '@/components/livekit/button';
import { ShoppingCart, Package, Sparkles } from 'lucide-react';

function ShoppingCartIcon() {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full"></div>
      <div className="relative bg-gradient-to-br from-green-600 to-emerald-800 p-6 rounded-2xl shadow-2xl">
        <ShoppingCart className="w-16 h-16 text-white" strokeWidth={1.5} />
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
    <div ref={ref} className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-green-950">
      <section className="flex flex-col items-center justify-center text-center px-4 py-12 min-h-screen">
        <ShoppingCartIcon />

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          QuickMart Express
        </h1>
        
        <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
          <Sparkles className="w-5 h-5 text-green-400" />
          <span className="text-green-300 font-semibold text-sm md:text-base">
            Voice Shopping Assistant
          </span>
        </div>

        <p className="text-slate-300 max-w-md text-base md:text-lg leading-relaxed mb-2">
          Order groceries, snacks, and prepared meals with just your voice
        </p>
        
        <p className="text-slate-400 max-w-lg text-sm md:text-base leading-relaxed mb-8">
          Shop naturally by talking to our AI assistant. From ingredients for recipes 
          to everyday groceries—we've got you covered!
        </p>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-8 max-w-md">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-green-400" />
            How It Works:
          </h3>
          <ul className="text-left text-slate-300 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-400 font-bold">1.</span>
              <span>Tell us what you need—items or ingredients for a meal</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 font-bold">2.</span>
              <span>We'll add items to your cart and confirm everything</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 font-bold">3.</span>
              <span>Review your cart and make changes anytime</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 font-bold">4.</span>
              <span>Place your order and we'll deliver it fast!</span>
            </li>
          </ul>
        </div>

        <Button 
          variant="primary" 
          size="lg" 
          onClick={onStartCall} 
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3"
        >
          <ShoppingCart className="w-5 h-5" />
          {startButtonText}
        </Button>

        <div className="mt-6 flex items-center gap-2 text-slate-500 text-xs">
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Shopping Experience</span>
        </div>

        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 max-w-md">
          <p className="text-blue-300 text-xs md:text-sm font-medium mb-2">
            💡 Pro Tip
          </p>
          <p className="text-blue-200/80 text-xs leading-relaxed">
            Try saying "I need ingredients for pasta" or "Get me what I need for a sandwich" 
            and watch the magic happen!
          </p>
        </div>
      </section>

      
    </div>  );
}