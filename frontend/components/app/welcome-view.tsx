import { Button } from '@/components/livekit/button';
import { Briefcase, Phone, Users, TrendingUp, ArrowRight, CheckCircle2, Sparkles, Zap, MessageCircle, UserCheck, DollarSign, Clock } from 'lucide-react';

function AnimatedBriefcaseIcon() {
  return (
    <div className="relative mb-8">
      {/* Pulsing rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-32 h-32 bg-blue-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
      </div>
      
      {/* Main icon container with floating animation */}
      <div className="relative bg-gradient-to-br from-blue-600 via-emerald-600 to-blue-700 rounded-3xl p-8 shadow-2xl transform hover:scale-110 transition-transform duration-500 animate-float">
        <Briefcase className="w-16 h-16 text-white" strokeWidth={1.5} />
        
        {/* Sparkle effects */}
        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
        <Sparkles className="absolute -bottom-2 -left-2 w-5 h-5 text-emerald-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <Zap className="absolute top-1/2 -left-4 w-5 h-5 text-yellow-300 animate-bounce" style={{ animationDelay: '0.3s' }} />
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: { 
  icon: any, 
  title: string, 
  description: string,
  color: string 
}) {
  const colorClasses = {
    blue: "from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800 hover:from-blue-500/20 hover:to-blue-600/20 hover:border-blue-300",
    emerald: "from-emerald-500/10 to-emerald-600/10 border-emerald-200 dark:border-emerald-800 hover:from-emerald-500/20 hover:to-emerald-600/20 hover:border-emerald-300",
    purple: "from-purple-500/10 to-purple-600/10 border-purple-200 dark:border-purple-800 hover:from-purple-500/20 hover:to-purple-600/20 hover:border-purple-300",
    amber: "from-amber-500/10 to-amber-600/10 border-amber-200 dark:border-amber-800 hover:from-amber-500/20 hover:to-amber-600/20 hover:border-amber-300"
  };

  const iconColorClasses = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
  };

  return (
    <div className={`group relative bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1`}>
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className={`relative ${iconColorClasses[color]} rounded-xl p-3 w-fit mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6" strokeWidth={2} />
      </div>
      
      <h3 className="relative font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      
      <p className="relative text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950" {...props}>
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      <section className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
        {/* Hero Icon */}
        <AnimatedBriefcaseIcon />

        {/* Badge with animation */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 via-emerald-100 to-blue-100 dark:from-blue-900/30 dark:via-emerald-900/30 dark:to-blue-900/30 text-blue-700 dark:text-blue-300 px-5 py-2 rounded-full text-sm font-semibold mb-6 border-2 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-pulse">
          <Phone className="w-4 h-4 animate-bounce" />
          <span>AI-Powered Sales Assistant</span>
        </div>

        {/* Main Headline with gradient animation */}
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 max-w-4xl">
          <span className="bg-gradient-to-r from-slate-900 via-blue-700 to-emerald-700 dark:from-slate-100 dark:via-blue-400 dark:to-emerald-400 bg-clip-text text-transparent animate-gradient">
            Meet Your AI SDR for Razorpay
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-8 leading-relaxed">
          Chat with our intelligent sales assistant to learn about Razorpay's payment solutions. 
          I'll answer your questions and help you find the perfect fit for your business.
        </p>

        {/* CTA Button with enhanced effects */}
        <Button 
          onClick={onStartCall}
          className="group relative bg-gradient-to-r from-blue-600 via-emerald-600 to-blue-600 hover:from-blue-700 hover:via-emerald-700 hover:to-blue-700 text-white px-12 py-7 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 mb-16 overflow-hidden"
        >
          <span className="relative flex items-center gap-3 z-10">
            <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            {startButtonText}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </span>
          
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          {/* Pulse effect */}
          <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
        </Button>

        {/* What the SDR Does */}
        <div className="w-full max-w-5xl mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            How I Can Help You Today
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            As your virtual SDR, I'm here to understand your business needs and show you how Razorpay can help
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={MessageCircle}
              title="Answer Questions"
              description="Get instant answers about products, pricing, features, and implementation"
              color="blue"
            />
            
            <FeatureCard
              icon={UserCheck}
              title="Understand Your Needs"
              description="Tell me about your business and I'll recommend the right solutions"
              color="emerald"
            />
            
            <FeatureCard
              icon={DollarSign}
              title="Discuss Pricing"
              description="Learn about our transparent pricing and find options that fit your budget"
              color="purple"
            />
            
            <FeatureCard
              icon={Clock}
              title="Quick Qualification"
              description="Share your timeline and requirements for personalized follow-up"
              color="amber"
            />
          </div>
        </div>

        {/* What You'll Discover */}
        <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border-2 border-slate-200 dark:border-slate-800 mb-12 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl p-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-left">
              Razorpay Solutions
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Payment Gateway (100+ payment modes)',
              'Payment Links & Pages',
              'Razorpay X Banking Platform',
              'POS & In-Store Solutions',
              'Instant Activation & Setup',
              'Enterprise-Grade Security',
              '99.99% Uptime Guarantee',
              'Volume Pricing Available'
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-3 text-left group hover:translate-x-2 transition-transform duration-300"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-slate-700 dark:text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats with enhanced styling */}
        <div className="grid grid-cols-3 gap-8 max-w-3xl w-full mb-8">
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform duration-300">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">100+</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Payment Methods</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 border border-emerald-200 dark:border-emerald-800 hover:scale-105 transition-transform duration-300">
            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent mb-2">2%</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Transaction Fee</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform duration-300">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-2">2min</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Quick Setup</div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-400 mb-8">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>PCI DSS Certified</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>No Setup Fees</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>24/7 Support</span>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t-2 border-slate-200 dark:border-slate-800 py-4 z-40 shadow-lg">
        <p className="text-center text-sm text-slate-600 dark:text-slate-400 px-4">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Powered by LiveKit Agents</span>
          {' • '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.livekit.io/agents/"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold underline underline-offset-4 transition-colors"
          >
            Learn More
          </a>
          {' • '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/livekit-examples/python-agents-examples"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold underline underline-offset-4 transition-colors"
          >
            View Examples
          </a>
        </p>
      </div>
    </div>
  );
};