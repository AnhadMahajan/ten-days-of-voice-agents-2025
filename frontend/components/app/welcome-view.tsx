import { Button } from '@/components/livekit/button';
import { ShoppingBag, Mic, Sparkles, ShoppingCart, Tag, Truck, Shield, Star, Zap, CheckCircle2, TrendingUp } from 'lucide-react';

function AnimatedShoppingIcon() {
  return (
    <div className="relative mb-8">
      {/* Pulsing rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-32 h-32 bg-purple-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 bg-pink-500/20 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
      </div>
      
      {/* Main icon container with floating animation */}
      <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 shadow-2xl transform hover:scale-110 transition-transform duration-500 animate-float">
        <ShoppingBag className="w-16 h-16 text-white" strokeWidth={1.5} />
        
        {/* Sparkle effects */}
        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
        <Sparkles className="absolute -bottom-2 -left-2 w-5 h-5 text-purple-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <Zap className="absolute top-1/2 -left-4 w-5 h-5 text-pink-300 animate-bounce" style={{ animationDelay: '0.3s' }} />
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
    purple: "from-purple-500/10 to-purple-600/10 border-purple-200 dark:border-purple-800 hover:from-purple-500/20 hover:to-purple-600/20 hover:border-purple-300",
    pink: "from-pink-500/10 to-pink-600/10 border-pink-200 dark:border-pink-800 hover:from-pink-500/20 hover:to-pink-600/20 hover:border-pink-300",
    orange: "from-orange-500/10 to-orange-600/10 border-orange-200 dark:border-orange-800 hover:from-orange-500/20 hover:to-orange-600/20 hover:border-orange-300",
    blue: "from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800 hover:from-blue-500/20 hover:to-blue-600/20 hover:border-blue-300"
  };

  const iconColorClasses = {
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    pink: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
    orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
  };

  return (
    <div className={`group relative bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1`}>
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
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-slate-950 to-orange-950" {...props}>
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
        <AnimatedShoppingIcon />

        {/* Badge with animation */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-purple-900/50 text-purple-200 px-5 py-2 rounded-full text-sm font-semibold mb-6 border-2 border-purple-500/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <Mic className="w-4 h-4 animate-pulse" />
          <span>AI Voice Shopping Assistant</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 max-w-4xl">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            Shop with Your Voice
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-8 leading-relaxed">
          Browse products, ask questions, and place orders - all through natural conversation with our AI shopping assistant
        </p>

        {/* CTA Button */}
        <Button 
          onClick={onStartCall}
          className="group relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 text-white px-12 py-7 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 mb-16 overflow-hidden"
        >
          <span className="relative flex items-center gap-3 z-10">
            <Mic className="w-5 h-5" />
            {startButtonText}
            <Sparkles className="w-5 h-5" />
          </span>
          
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </Button>

        {/* How It Works */}
        <div className="w-full max-w-5xl mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            How Voice Shopping Works
          </h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Shop naturally with our AI assistant - just speak what you're looking for
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Mic}
              title="Speak Naturally"
              description="Tell the assistant what you're looking for in your own words"
              color="purple"
            />
            
            <FeatureCard
              icon={ShoppingCart}
              title="Browse Products"
              description="Get personalized product recommendations based on your needs"
              color="pink"
            />
            
            <FeatureCard
              icon={Tag}
              title="Ask Questions"
              description="Learn about prices, features, sizes, and availability"
              color="orange"
            />
            
            <FeatureCard
              icon={CheckCircle2}
              title="Place Orders"
              description="Complete your purchase with simple voice commands"
              color="blue"
            />
          </div>
        </div>

        {/* Product Categories */}
        <div className="w-full max-w-4xl bg-slate-900/50 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 border-slate-800 mb-12 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl p-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white text-left">
              What You Can Shop
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Coffee Mugs (₹499+)',
              'Cotton T-Shirts (₹799+)',
              'Premium Hoodies (₹1,799+)',
              'Water Bottles & Accessories',
              'Tote Bags & Stationery',
              'Multiple Colors Available',
              'All Sizes (S, M, L, XL)',
              'In Stock & Ready to Ship'
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-3 text-left group hover:translate-x-2 transition-transform duration-300"
              >
                <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-3xl w-full mb-8">
          <div className="text-center p-6 rounded-2xl bg-purple-900/30 border border-purple-700/50 hover:scale-105 transition-transform duration-300">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent mb-2">100+</div>
            <div className="text-sm text-slate-400 font-medium">Products</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-pink-900/30 border border-pink-700/50 hover:scale-105 transition-transform duration-300">
            <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-pink-300 bg-clip-text text-transparent mb-2">24/7</div>
            <div className="text-sm text-slate-400 font-medium">AI Assistant</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-orange-900/30 border border-orange-700/50 hover:scale-105 transition-transform duration-300">
            <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent mb-2">Fast</div>
            <div className="text-sm text-slate-400 font-medium">Delivery</div>
          </div>
        </div>

        {/* Example Commands */}
        <div className="w-full max-w-2xl bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-orange-900/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 mb-8">
          <p className="text-purple-300 text-sm font-semibold mb-4 flex items-center justify-center gap-2">
            <Mic className="w-5 h-5" />
            Try Saying:
          </p>
          <div className="grid md:grid-cols-2 gap-3 text-left">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <p className="text-slate-300 text-sm">
                💬 <strong className="text-purple-400">"Show me black hoodies"</strong>
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <p className="text-slate-300 text-sm">
                💬 <strong className="text-pink-400">"I need a mug under 500 rupees"</strong>
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <p className="text-slate-300 text-sm">
                💬 <strong className="text-orange-400">"Tell me about the second one"</strong>
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <p className="text-slate-300 text-sm">
                💬 <strong className="text-blue-400">"I'll buy that in size medium"</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400 mb-8">
          <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
            <Shield className="w-4 h-4 text-green-400" />
            <span>Secure Shopping</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>4.9/5 Rating</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
            <Truck className="w-4 h-4 text-purple-400" />
            <span>Fast Delivery</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t-2 border-slate-800 py-4 z-40 shadow-lg">
        <p className="text-center text-sm text-slate-400 px-4">
          <span className="font-semibold text-slate-300">Powered by AI Voice Technology</span>
          {' • '}
          <span className="text-purple-400">Shop naturally with your voice</span>
        </p>
      </div>
    </div>
  );
};