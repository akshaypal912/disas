"use client";

import React, { useState } from "react";
import { Mail, Lock, Loader2, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPasswordClick?: () => void;
  onSignupClick?: () => void;
}

export function LoginForm({ onSuccess, onForgotPasswordClick, onSignupClick }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Direct integration call mock/real based on environment
      // const supabase = createClient();
      // const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      // Simulating network request for high responsiveness
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      if (email.includes("fail")) {
        throw new Error("Invalid login credentials. Please check your email or password.");
      }

      setSuccess("Successfully logged in! Redirecting to secure operational dashboard...");
      if (onSuccess) {
        setTimeout(onSuccess, 1000);
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-slate-900/50 border border-slate-900 rounded-2xl shadow-xl backdrop-blur-md">
      <div className="space-y-2 text-center mb-6">
        <h3 className="text-xl font-bold text-white tracking-tight">Access Tactical HUD</h3>
        <p className="text-xs text-slate-400">Enter your certified emergency credentials to access maps.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2.5 text-xs text-red-400">
          <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-2.5 text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@disaster-response.gov"
              className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-200 outline-none transition"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">Password</label>
            <button
              type="button"
              onClick={onForgotPasswordClick}
              className="text-[10px] text-red-400 hover:text-red-300 hover:underline"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-200 outline-none transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/10"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>AUTHENTICATING NODE...</span>
            </>
          ) : (
            <>
              <span>ESTABLISH SECURE SESSION</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-900 text-center text-[11px] text-slate-400">
        Don't have terminal clearance?{" "}
        <button onClick={onSignupClick} className="text-red-400 hover:text-red-300 hover:underline font-semibold">
          Create Account
        </button>
      </div>
    </div>
  );
}
