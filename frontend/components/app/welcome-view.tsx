import { Button } from '@/components/livekit/button';
import { Brain, BookOpen, MessageSquare, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

function AnimatedBrainIcon() {
  return (
    <div className="relative mb-8">
      {/* Pulsing rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-32 h-32 bg-blue-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 bg-purple-500/20 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
      </div>
      
      {/* Main icon container */}
      <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-3xl p-8 shadow-2xl transform hover:scale-110 transition-transform duration-500">
        <Brain className="w-16 h-16 text-white" strokeWidth={1.5} />
        
        {/* Sparkle effects */}
        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
        <Sparkles className="absolute -bottom-2 -left-2 w-5 h-5 text-blue-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
    </div>
  );
}

function ModeCard({ icon: Icon, title, voice, description, color }: { 
  icon: any, 
  title: string, 
  voice: string, 
  description: string,
  color: string 
}) {
  const colorClasses = {
    blue: "from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800 hover:from-blue-500/20 hover:to-blue-600/20",
    purple: "from-purple-500/10 to-purple-600/10 border-purple-200 dark:border-purple-800 hover:from-purple-500/20 hover:to-purple-600/20",
    pink: "from-pink-500/10 to-pink-600/10 border-pink-200 dark:border-pink-800 hover:from-pink-500/20 hover:to-pink-600/20"
  };

  const iconColorClasses = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    pink: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400"
  };

  return (
    <div className={`group relative bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
      <div className={`${iconColorClasses[color]} rounded-xl p-3 w-fit mb-4 shadow-sm`}>
        <Icon className="w-6 h-6" strokeWidth={2} />
      </div>
      
      <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h3>
      
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
        Voice: {voice}
      </p>
      
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
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
  ...props
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" {...props}>
      <section className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
        {/* Hero Icon */}
        <AnimatedBrainIcon />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-blue-200 dark:border-blue-800">
          <Sparkles className="w-4 h-4" />
          <span>Active Recall Learning</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 max-w-4xl">
          <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-purple-900 dark:from-slate-100 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
            Learn by Teaching
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-8 leading-relaxed">
          Master programming concepts through three AI-powered learning modes. Each mode features a specialized voice coach to guide your learning journey.
        </p>

        {/* CTA Button */}
        <Button 
          onClick={onStartCall}
          className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-7 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 mb-12"
        >
          <span className="flex items-center gap-3">
            {startButtonText}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
          
          {/* Animated shine */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </Button>

        {/* Three Learning Modes */}
        <div className="w-full max-w-5xl mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">
            Three Ways to Master Any Concept
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <ModeCard
              icon={BookOpen}
              title="Learn Mode"
              voice="Matthew"
              description="Get clear explanations using the Feynman Technique with concrete examples and analogies"
              color="blue"
            />
            
            <ModeCard
              icon={Brain}
              title="Quiz Mode"
              voice="Alicia"
              description="Test your understanding with thoughtful questions and receive constructive feedback"
              color="purple"
            />
            
            <ModeCard
              icon={MessageSquare}
              title="Teach-Back Mode"
              voice="Ken"
              description="Solidify your knowledge by explaining concepts while receiving detailed evaluation"
              color="pink"
            />
          </div>
        </div>

        {/* Features List */}
        <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-800 mb-12">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 text-left">
            What You'll Learn
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Variables & Data Types',
              'Loops & Iteration',
              'Functions & Reusability',
              'Conditionals & Logic',
              'And more concepts...'
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-left">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl w-full mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">3</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Learning Modes</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-2">5+</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Core Concepts</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent mb-2">∞</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Practice Sessions</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 py-4 z-40">
        <p className="text-center text-sm text-slate-600 dark:text-slate-400 px-4">
          Need help? Check out the{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.livekit.io/agents/start/voice-ai/"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold underline underline-offset-4 transition-colors"
          >
            Voice AI quickstart
          </a>
          {' '}or explore{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/livekit-examples/python-agents-examples"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold underline underline-offset-4 transition-colors"
          >
            example agents
          </a>
        </p>
      </div>
    </div>
  );
};