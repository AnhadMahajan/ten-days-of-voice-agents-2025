import { Button } from '@/components/livekit/button';
import { Shield, AlertTriangle, Phone } from 'lucide-react';

function SecurityShieldIcon() {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
      <div className="relative bg-gradient-to-br from-red-600 to-red-800 p-6 rounded-2xl shadow-2xl">
        <Shield className="w-16 h-16 text-white" strokeWidth={1.5} />
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
    <div ref={ref} className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-red-950">
      <section className="flex flex-col items-center justify-center text-center px-4 py-12 min-h-screen">
        <SecurityShieldIcon />

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          SecureBank India
        </h1>
        
        <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span className="text-red-300 font-semibold text-sm md:text-base">
            Fraud Detection Department
          </span>
        </div>

        <p className="text-slate-300 max-w-md text-base md:text-lg leading-relaxed mb-2">
          We've detected suspicious activity on your account
        </p>
        
        <p className="text-slate-400 max-w-lg text-sm md:text-base leading-relaxed mb-8">
          Our fraud detection system has flagged a potentially unauthorized transaction. 
          Please verify your identity to proceed.
        </p>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-8 max-w-md">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Phone className="w-5 h-5 text-red-400" />
            What to Expect:
          </h3>
          <ul className="text-left text-slate-300 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">1.</span>
              <span>Identity verification using your security question</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">2.</span>
              <span>Review of the suspicious transaction details</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">3.</span>
              <span>Confirmation if you authorized the transaction</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">4.</span>
              <span>Immediate action to protect your account</span>
            </li>
          </ul>
        </div>

        <Button 
          variant="primary" 
          size="lg" 
          onClick={onStartCall} 
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3"
        >
          <Phone className="w-5 h-5" />
          {startButtonText}
        </Button>

        <div className="mt-6 flex items-center gap-2 text-slate-500 text-xs">
          <Shield className="w-4 h-4" />
          <span>Secure & Encrypted Connection</span>
        </div>

        <div className="mt-8 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 max-w-md">
          <p className="text-amber-300 text-xs md:text-sm font-medium mb-2">
            🔒 Security Reminder
          </p>
          <p className="text-amber-200/80 text-xs leading-relaxed">
            We will NEVER ask for your PIN, password, CVV, or OTP. 
            If anyone asks for these, it's a scam.
          </p>
        </div>
      </section>

      <div className="fixed bottom-5 left-0 flex w-full items-center justify-center px-4">
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-3 max-w-2xl">
          <p className="text-slate-300 text-xs leading-5 text-center">
            <strong className="text-red-400">Demo Environment:</strong> This is a simulated fraud alert system for demonstration purposes. 
            All data is fictional. For real fraud alerts, contact your bank directly.
          </p>
        </div>
      </div>
    </div>
  );
};