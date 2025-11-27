import { Shield, AlertTriangle, Phone, Lock, Clock, CheckCircle2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const bankName = "SecureBank India";

  return (
    <>
      {/* Enhanced Header */}
      <header className="fixed top-0 left-0 z-50 w-full border-b border-red-900/30 bg-slate-950/90 backdrop-blur-xl">
        <nav className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Logo and Brand */}
          <a
            href="/"
            className="group flex items-center gap-3 transition-all duration-300"
          >
            {/* Animated logo container */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-700 rounded-lg blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
              <div className="relative bg-gradient-to-br from-red-600 to-red-800 rounded-lg p-2 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <Shield className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
            </div>
            
            {/* Brand name */}
            <div className="flex flex-col">
              <span className="font-bold text-lg bg-gradient-to-r from-white to-red-300 bg-clip-text text-transparent">
                {bankName}
              </span>
              <span className="text-xs text-red-400 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Fraud Detection
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {/* Alert Status Badge */}
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 text-red-300 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <AlertTriangle className="w-3 h-3" />
              <span>Alert Active</span>
            </div>

            {/* Security Stats */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs">
                <Lock className="w-3.5 h-3.5 text-green-400" />
                <span className="text-slate-400 font-medium">
                  <span className="font-bold text-white">256-bit</span> Encrypted
                </span>
              </div>
              <div className="w-px h-4 bg-slate-700" />
              <div className="flex items-center gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-400 font-medium">
                  <span className="font-bold text-white">24/7</span> Protection
                </span>
              </div>
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-slate-700" />

            {/* Emergency Contact */}
            <a
              href="tel:1800-XXX-XXXX"
              className="group flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors font-medium"
            >
              <Phone className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>24/7 Helpline</span>
            </a>

            {/* Secure Connection Badge */}
            <div className="flex items-center gap-2 bg-green-900/30 border border-green-600/30 px-3 py-1.5 rounded-full">
              <Lock className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-300 font-medium">
                Secure Connection
              </span>
            </div>
          </div>

          {/* Mobile menu */}
          <div className="flex md:hidden items-center gap-3">
            {/* Mobile alert indicator */}
            <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 text-red-300 px-2.5 py-1 rounded-full text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <AlertTriangle className="w-3 h-3" />
              <span>Alert</span>
            </div>
            
            {/* Mobile secure badge */}
            <div className="flex items-center gap-1.5 bg-green-900/30 border border-green-600/30 px-2.5 py-1 rounded-full">
              <Lock className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-300 font-medium">Secure</span>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content with proper spacing for fixed header */}
      <main className="pt-16 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-red-950">
        {children}
      </main>

      {/* Floating Emergency Contact */}
      <div className="fixed bottom-6 right-6 z-50 hidden lg:block">
        <div className="relative">
          {/* Pulsing ring */}
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
          
          <a
            href="tel:1800-XXX-XXXX"
            className="relative group flex items-center gap-3 bg-slate-900 border-2 border-red-600 text-white px-5 py-3 rounded-full shadow-xl hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 hover:border-red-500"
          >
            <Phone className="w-4 h-4 text-red-400 group-hover:animate-bounce" />
            <div className="flex flex-col items-start">
              <span className="text-xs text-slate-400 font-medium">Emergency</span>
              <span className="text-sm font-bold">1800-XXX-XXXX</span>
            </div>
          </a>
        </div>
      </div>

      {/* Floating Security Info Card */}
      <div className="fixed bottom-6 left-6 z-50 hidden xl:block">
        <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl shadow-xl p-4 hover:shadow-2xl transition-all duration-300 hover:scale-105 max-w-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-2">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Security Status</p>
              <p className="text-sm font-bold text-white">All Systems Protected</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Active Monitoring</span>
              <span className="text-green-400 font-semibold flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Online
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Fraud Detection</span>
              <span className="text-green-400 font-semibold">Enabled</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Account Safety</span>
              <span className="text-green-400 font-semibold">Secured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Warning Banner (Floating) */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 hidden md:block">
        <div className="bg-amber-900/80 backdrop-blur-sm border border-amber-600/50 rounded-lg px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2 text-xs">
            <Lock className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-amber-200 font-medium">
              We will <strong>NEVER</strong> ask for your PIN, password, CVV, or OTP
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Warning Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-amber-900/90 backdrop-blur-sm border-t border-amber-600/50 px-4 py-3">
        <div className="flex items-start gap-2 text-xs">
          <Lock className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
          <span className="text-amber-200 font-medium">
            Security: We'll <strong>NEVER</strong> ask for PIN, password, CVV, or OTP
          </span>
        </div>
      </div>
    </>
  );
}