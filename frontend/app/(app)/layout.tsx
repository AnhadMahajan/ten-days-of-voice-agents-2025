import { ShoppingCart, Sparkles, Phone, Lock, Clock, CheckCircle2, Package, Leaf } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const storeName = "QuickMart Express";

  return (
    <>
      {/* Enhanced Header */}
      <header className="fixed top-0 left-0 z-50 w-full border-b border-green-900/30 bg-slate-950/90 backdrop-blur-xl">
        <nav className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Logo and Brand */}
          <a
            href="/"
            className="group flex items-center gap-3 transition-all duration-300"
          >
            {/* Animated logo container */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-700 rounded-lg blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
              <div className="relative bg-gradient-to-br from-green-600 to-emerald-800 rounded-lg p-2 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <ShoppingCart className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
            </div>
            
            {/* Brand name */}
            <div className="flex flex-col">
              <span className="font-bold text-lg bg-gradient-to-r from-white to-green-300 bg-clip-text text-transparent">
                {storeName}
              </span>
              <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Voice Shopping
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {/* AI Status Badge */}
            <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/40 text-green-300 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <Sparkles className="w-3 h-3" />
              <span>AI Assistant Active</span>
            </div>

            {/* Service Stats */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-400 font-medium">
                  <span className="font-bold text-white">10-min</span> Delivery
                </span>
              </div>
              <div className="w-px h-4 bg-slate-700" />
              <div className="flex items-center gap-1.5 text-xs">
                <Leaf className="w-3.5 h-3.5 text-green-400" />
                <span className="text-slate-400 font-medium">
                  <span className="font-bold text-white">Fresh</span> Guarantee
                </span>
              </div>
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-slate-700" />

            {/* Customer Support */}
            <a
              href="tel:1800-XXX-XXXX"
              className="group flex items-center gap-2 text-sm text-slate-400 hover:text-green-400 transition-colors font-medium"
            >
              <Phone className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>24/7 Support</span>
            </a>

            {/* Secure Shopping Badge */}
            <div className="flex items-center gap-2 bg-blue-900/30 border border-blue-600/30 px-3 py-1.5 rounded-full">
              <Lock className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-blue-300 font-medium">
                Secure Shopping
              </span>
            </div>
          </div>

          {/* Mobile menu */}
          <div className="flex md:hidden items-center gap-3">
            {/* Mobile AI indicator */}
            <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-500/40 text-green-300 px-2.5 py-1 rounded-full text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <Sparkles className="w-3 h-3" />
              <span>AI Active</span>
            </div>
            
            {/* Mobile secure badge */}
            <div className="flex items-center gap-1.5 bg-blue-900/30 border border-blue-600/30 px-2.5 py-1 rounded-full">
              <Lock className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-blue-300 font-medium">Secure</span>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content with proper spacing for fixed header */}
      <main className="pt-16 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-green-950">
        {children}
      </main>

      {/* Floating Customer Support */}
      <div className="fixed bottom-6 right-6 z-50 hidden lg:block">
        <div className="relative">
          {/* Pulsing ring */}
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
          
          <a
            href="tel:1800-XXX-XXXX"
            className="relative group flex items-center gap-3 bg-slate-900 border-2 border-green-600 text-white px-5 py-3 rounded-full shadow-xl hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 hover:border-green-500"
          >
            <Phone className="w-4 h-4 text-green-400 group-hover:animate-bounce" />
            <div className="flex flex-col items-start">
              <span className="text-xs text-slate-400 font-medium">Need Help?</span>
              <span className="text-sm font-bold">1800-XXX-XXXX</span>
            </div>
          </a>
        </div>
      </div>

      {/* Floating Service Info Card */}
      <div className="fixed bottom-6 left-6 z-50 hidden xl:block">
        <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl shadow-xl p-4 hover:shadow-2xl transition-all duration-300 hover:scale-105 max-w-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-2">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Shopping Status</p>
              <p className="text-sm font-bold text-white">Ready to Serve</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">AI Assistant</span>
              <span className="text-green-400 font-semibold flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Online
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Delivery Available</span>
              <span className="text-green-400 font-semibold">Yes</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Store Status</span>
              <span className="text-green-400 font-semibold">Open 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Tip Banner (Floating) */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 hidden md:block">
        <div className="bg-blue-900/80 backdrop-blur-sm border border-blue-600/50 rounded-lg px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span className="text-blue-200 font-medium">
              Try saying <strong>"ingredients for pasta"</strong> or <strong>"what I need for a sandwich"</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Pro Tip Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-blue-900/90 backdrop-blur-sm border-t border-blue-600/50 px-4 py-3">
        <div className="flex items-start gap-2 text-xs">
          <Sparkles className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" />
          <span className="text-blue-200 font-medium">
            <strong>Pro Tip:</strong> Try "ingredients for pasta" or "breakfast items"
          </span>
        </div>
      </div>

      {/* Quick Categories Badge */}
      <div className="fixed top-20 right-6 z-40 hidden lg:block">
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-green-400" />
            <span className="text-xs text-slate-300 font-semibold">Quick Categories</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">Groceries</span>
            <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">Snacks</span>
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">Meals</span>
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">Beverages</span>
          </div>
        </div>
      </div>
    </>
  );
}