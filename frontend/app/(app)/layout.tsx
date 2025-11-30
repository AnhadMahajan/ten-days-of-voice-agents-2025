import { ShoppingBag, Sparkles, Mic, ShoppingCart, Headphones, Tag, Star, Shield } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const storeName = "VoiceShop";

  return (
    <>
      {/* Enhanced Header */}
      <header className="fixed top-0 left-0 z-50 w-full border-b border-purple-900/30 bg-slate-950/90 backdrop-blur-xl">
        <nav className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Logo and Brand */}
          <a
            href="/"
            className="group flex items-center gap-3 transition-all duration-300"
          >
            {/* Animated logo container */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-xl blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
              <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-xl p-2 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <ShoppingBag className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
            </div>
            
            {/* Brand name */}
            <div className="flex flex-col">
              <span className="font-bold text-lg bg-gradient-to-r from-white via-purple-300 to-pink-300 bg-clip-text text-transparent">
                {storeName}
              </span>
              <span className="text-xs text-purple-400 font-medium flex items-center gap-1">
                <Mic className="w-3 h-3" />
                Voice Shopping
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {/* AI Status Badge */}
            <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <Sparkles className="w-3 h-3" />
              <span>AI Assistant Active</span>
            </div>

            {/* Shopping Stats */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs">
                <ShoppingCart className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-slate-400 font-medium">
                  <span className="font-bold text-white">100+</span> Products
                </span>
              </div>
              <div className="w-px h-4 bg-slate-700" />
              <div className="flex items-center gap-1.5 text-xs">
                <Tag className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-slate-400 font-medium">
                  <span className="font-bold text-white">Best</span> Prices
                </span>
              </div>
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-slate-700" />

            {/* Support Link */}
            <a
              href="#"
              className="group flex items-center gap-2 text-sm text-slate-400 hover:text-purple-400 transition-colors font-medium"
            >
              <Headphones className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Help & Support</span>
            </a>

            {/* VIP Badge */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-orange-900/40 border border-purple-500/30 px-3 py-1.5 rounded-full">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-purple-200 font-medium">
                Premium Shopper
              </span>
            </div>
          </div>

          {/* Mobile menu */}
          <div className="flex md:hidden items-center gap-3">
            {/* Mobile AI indicator */}
            <div className="flex items-center gap-1.5 bg-purple-500/20 border border-purple-500/40 text-purple-300 px-2.5 py-1 rounded-full text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
              <Mic className="w-3 h-3" />
              <span>AI Active</span>
            </div>
            
            {/* Mobile cart badge */}
            <div className="flex items-center gap-1.5 bg-pink-900/30 border border-pink-600/30 px-2.5 py-1 rounded-full">
              <ShoppingCart className="w-3 h-3 text-pink-400" />
              <span className="text-xs text-pink-300 font-medium">Cart</span>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content with proper spacing for fixed header */}
      <main className="pt-16 min-h-screen bg-gradient-to-br from-purple-950 via-slate-950 to-orange-950">
        {children}
      </main>

      {/* Floating Support Button */}
      <div className="fixed bottom-6 right-6 z-50 hidden lg:block">
        <div className="relative">
          {/* Pulsing ring */}
          <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-20" />
          
          <a
            href="#"
            className="relative group flex items-center gap-3 bg-slate-900 border-2 border-purple-600 text-white px-5 py-3 rounded-full shadow-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 hover:border-purple-500"
          >
            <Headphones className="w-4 h-4 text-purple-400 group-hover:animate-bounce" />
            <div className="flex flex-col items-start">
              <span className="text-xs text-slate-400 font-medium">Need Help?</span>
              <span className="text-sm font-bold">Live Support</span>
            </div>
          </a>
        </div>
      </div>

      {/* Floating Shopping Status Card */}
      <div className="fixed bottom-6 left-6 z-50 hidden xl:block">
        <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl shadow-xl p-4 hover:shadow-2xl transition-all duration-300 hover:scale-105 max-w-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg p-2">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Shopping Status</p>
              <p className="text-sm font-bold text-white">Ready to Shop</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">AI Assistant</span>
              <span className="text-purple-400 font-semibold flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                Online
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Mode</span>
              <span className="text-purple-400 font-semibold">Voice Shopping</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Cart Status</span>
              <span className="text-purple-400 font-semibold">🛒 Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Tip Banner (Floating) */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 hidden md:block">
        <div className="bg-purple-900/80 backdrop-blur-sm border border-purple-600/50 rounded-lg px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2 text-xs">
            <Mic className="w-3.5 h-3.5 text-purple-300" />
            <span className="text-purple-200 font-medium">
              Try saying <strong>"Show me hoodies"</strong> or <strong>"I need a coffee mug"</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Pro Tip Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-purple-900/90 backdrop-blur-sm border-t border-purple-600/50 px-4 py-3">
        <div className="flex items-start gap-2 text-xs">
          <Mic className="w-4 h-4 text-purple-300 flex-shrink-0 mt-0.5" />
          <span className="text-purple-200 font-medium">
            <strong>Shopping Tip:</strong> Say "show me products" or "I want to buy" to start!
          </span>
        </div>
      </div>

      {/* Quick Categories Badge */}
      <div className="fixed top-20 right-6 z-40 hidden lg:block">
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-300 font-semibold">Quick Browse</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">☕ Mugs</span>
            <span className="text-xs bg-pink-500/20 text-pink-300 px-2 py-1 rounded-full">👕 Apparel</span>
            <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">🎁 Accessories</span>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="fixed top-36 right-6 z-40 hidden xl:block">
        <div className="bg-green-900/30 backdrop-blur-sm border border-green-600/40 rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-400" />
            <div>
              <p className="text-xs text-green-300 font-semibold">Secure Shopping</p>
              <p className="text-[10px] text-green-400/80">Encrypted & Safe</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Deal Banner */}
      <div className="fixed top-36 left-6 z-40 hidden xl:block">
        <div className="bg-gradient-to-r from-orange-900/80 to-pink-900/80 backdrop-blur-sm border border-orange-600/50 rounded-lg p-3 shadow-lg max-w-xs">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-orange-300" />
            <span className="text-xs text-orange-200 font-bold">Today's Deal!</span>
          </div>
          <p className="text-xs text-orange-100 leading-relaxed">
            Get <strong>20% off</strong> on all hoodies!
          </p>
          <p className="text-[10px] text-orange-300/80 mt-1">Use voice: "Show me hoodies"</p>
        </div>
      </div>
    </>
  );
}