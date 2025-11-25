import { Briefcase, Github, Sparkles, Phone, Users, TrendingUp } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Mock data - replace with your actual getAppConfig
  const companyName = "Razorpay";
  const logo = "/logo.svg";
  const logoDark = "/logo-dark.svg";

  return (
    <>
      {/* Enhanced Header */}
      <header className="fixed top-0 left-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <nav className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Logo and Brand */}
          <a
            href="/"
            className="group flex items-center gap-3 transition-all duration-300"
          >
            {/* Animated logo container */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-600 rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              <div className="relative bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg p-2 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <Briefcase className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
            </div>
            
            {/* Brand name */}
            <div className="flex flex-col">
              <span className="font-bold text-lg bg-gradient-to-r from-slate-900 to-blue-700 dark:from-slate-100 dark:to-blue-400 bg-clip-text text-transparent">
                {companyName}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                AI Sales Assistant
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {/* Status Badge with animation */}
            <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <Phone className="w-3 h-3" />
              <span>SDR Online</span>
            </div>

            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  <span className="font-bold text-slate-900 dark:text-slate-100">8M+</span> Users
                </span>
              </div>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700" />
              <div className="flex items-center gap-1.5 text-xs">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  <span className="font-bold text-slate-900 dark:text-slate-100">99.99%</span> Uptime
                </span>
              </div>
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-700" />

            {/* Links */}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.livekit.io/agents"
              className="group flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>Docs</span>
            </a>

            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/livekit-examples/python-agents-examples"
              className="group flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>GitHub</span>
            </a>

            {/* Built with badge */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Powered by
              </span>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://livekit.io"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                LiveKit
              </a>
            </div>
          </div>

          {/* Mobile menu */}
          <div className="flex md:hidden items-center gap-3">
            {/* Mobile status indicator */}
            <div className="flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>Live</span>
            </div>
            
            {/* Mobile LiveKit badge */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Built with
              </span>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://livekit.io"
                className="text-xs font-bold text-blue-600 dark:text-blue-400"
              >
                LiveKit
              </a>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content with proper spacing for fixed header */}
      <main className="pt-16">
        {children}
      </main>

      {/* Floating Contact Badge */}
      <div className="fixed bottom-6 right-6 z-50 hidden lg:block">
        <div className="relative">
          {/* Pulsing ring */}
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" />
          
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.livekit.io/agents/start/voice-ai/"
            className="relative group flex items-center gap-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-5 py-3 rounded-full shadow-xl hover:shadow-2xl border-2 border-blue-200 dark:border-blue-800 transition-all duration-300 hover:scale-105 hover:border-blue-400 dark:hover:border-blue-600"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold">Need Help?</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium">
              View Docs →
            </span>
          </a>
        </div>
      </div>

      {/* Floating Stats Card (Optional - can be toggled) */}
      <div className="fixed bottom-6 left-6 z-50 hidden xl:block">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border-2 border-slate-200 dark:border-slate-800 p-4 hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg p-2">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Users</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">8M+</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </>
  );
}