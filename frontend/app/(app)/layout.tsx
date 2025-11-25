import { Brain, Github, Sparkles } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Mock data - replace with your actual getAppConfig
  const companyName = "ActiveRecall";
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
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-2 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Brain className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
            </div>
            
            {/* Brand name */}
            <div className="flex flex-col">
              <span className="font-bold text-lg bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                {companyName}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Active Recall Coach
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {/* Status Badge */}
            <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-full text-xs font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>AI Ready</span>
            </div>

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
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Built with
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

          {/* Mobile menu badge */}
          <div className="flex md:hidden items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
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
        </nav>
      </header>

      {/* Main Content with proper spacing for fixed header */}
      <main className="pt-16">
        {children}
      </main>

      {/* Optional: Floating help button */}
      <div className="fixed bottom-6 right-6 z-50 hidden lg:block">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://docs.livekit.io/agents/start/voice-ai/"
          className="group flex items-center gap-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-5 py-3 rounded-full shadow-xl hover:shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:scale-105"
        >
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium">Need help?</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            View docs →
          </span>
        </a>
      </div>
    </>
  );
}