import React, { useState } from 'react';
import { Lock, ShieldCheck, Mail, Loader2, ArrowRight, Activity, Terminal } from 'lucide-react';
import { signInWithPopup, User } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

interface LoginPageProps {
  onLoginSuccess: (user: { email: string; role: string; token: string }) => void;
  theme: 'dark' | 'light';
}

export function LoginPage({ onLoginSuccess, theme }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSimulatedLoading, setIsSimulatedLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMsg(null);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const token = await result.user.getIdToken();

      // Register / upsert user in the database and retrieve their role
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();

      // Use the role returned by the server if available, fall back to 'coordinator'
      const role = data?.user?.role || 'coordinator';

      onLoginSuccess({
        email: result.user.email || 'operator@resp.ai',
        role,
        token,
      });
    } catch (err: any) {
      console.error("Google login failed:", err);
      setErrorMsg("Google Authentication was cancelled or failed to resolve.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSimulatedAccess = async () => {
    setIsSimulatedLoading(true);
    setErrorMsg(null);
    try {
      // Simulate connection latency
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Create local simulated token
      const mockToken = `mock_token_coordinator_${Date.now()}`;
      onLoginSuccess({
        email: 'commander@resp.ai',
        role: 'coordinator',
        token: mockToken,
      });
    } catch (err: any) {
      setErrorMsg("Failed to establish simulation session.");
    } finally {
      setIsSimulatedLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all security fields.");
      return;
    }
    setIsEmailLoading(true);
    setErrorMsg(null);
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const result = await signInWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();

      // Register / upsert user in the database
      await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      onLoginSuccess({
        email: result.user.email || email,
        role: 'coordinator',
        token,
      });
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMsg("Invalid email or password. Please try again.");
      } else if (code === 'auth/too-many-requests') {
        setErrorMsg("Too many failed attempts. Please wait before retrying.");
      } else if (code === 'auth/invalid-email') {
        setErrorMsg("Invalid email address format.");
      } else {
        setErrorMsg(err.message || "Authentication credentials rejected.");
      }
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
      
      {/* Glowing Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-60 h-60 bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-red-600 items-center justify-center font-black text-white text-xl shadow-[0_0_25px_rgba(239,68,68,0.4)] mb-2 animate-pulse">
            RA
          </div>
          <h1 className="text-2xl font-black tracking-wider text-white">RESP-AI SECURE PORTAL</h1>
          <p className="text-slate-400 text-xs max-w-xs mx-auto font-mono uppercase tracking-widest text-[9.5px]">
            TACTICAL DISASTER COORDINATION NETWORK
          </p>
        </div>

        {/* Central Auth Container */}
        <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Lock className="h-4 w-4 text-red-500" />
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">Authentication Required</span>
            <div className="ml-auto flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-mono text-emerald-400">SECURE SHELL</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-lg text-[11px] text-red-400 font-mono leading-relaxed">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Authorized Operator Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@resp.ai"
                  className="w-full bg-slate-950/80 border border-slate-800/80 rounded-lg py-2.5 pl-9 pr-3 text-xs text-slate-200 outline-none focus:border-red-500 transition font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Access PIN / Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800/80 rounded-lg py-2.5 pl-9 pr-3 text-xs text-slate-200 outline-none focus:border-red-500 transition font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isEmailLoading || isGoogleLoading || isSimulatedLoading}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-mono font-bold rounded-lg transition text-[11px] uppercase tracking-wider flex justify-center items-center gap-1.5 cursor-pointer border border-slate-700/50"
            >
              {isEmailLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" />
              ) : (
                <>
                  <span>Sign In with Credentials</span>
                  <ArrowRight className="h-3.5 w-3.5 text-red-500" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-2 text-slate-600 font-mono text-[9px] uppercase">
            <div className="h-px bg-slate-800 flex-1" />
            <span>Alternative Access Gates</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          <div className="grid grid-cols-1 gap-2">
            {/* Google Firebase Login */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isEmailLoading || isGoogleLoading || isSimulatedLoading}
              className="w-full py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 font-mono font-bold rounded-lg transition text-[11px] uppercase tracking-wider flex justify-center items-center gap-2 cursor-pointer"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Google Single Sign-On</span>
                </>
              )}
            </button>

            {/* Quick Simulation Access */}
            <button
              onClick={handleSimulatedAccess}
              disabled={isEmailLoading || isGoogleLoading || isSimulatedLoading}
              className="w-full py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 font-mono font-bold rounded-lg transition text-[11px] uppercase tracking-wider flex justify-center items-center gap-2 cursor-pointer"
            >
              {isSimulatedLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Activity className="h-4 w-4 animate-pulse" />
                  <span>Instant Coordinator Session</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security / Compliance Notice Footer */}
        <div className="text-center space-y-1.5">
          <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <Terminal className="h-3 w-3 text-red-500" />
            <span>Connection Secure • TLS 1.3 Certified</span>
          </p>
          {/* FIX LOW #25: Removed false claim about "RESP-AI Defense Network" monitoring */}
          <p className="text-[9px] text-slate-600 max-w-xs mx-auto leading-normal">
            All access attempts are logged for security purposes. Unauthorized access is prohibited.
          </p>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;
