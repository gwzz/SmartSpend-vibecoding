import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Button } from '../components/ui';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNeedsConfirmation(false);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.session) {
            // Session exists, user is logged in automatically
        } else if (data.user) {
            // User created, but no session -> Email confirmation required
            // We set error/warning immediately to guide the user
            setError("Registration successful! Please check your email to confirm your account before logging in.");
            setNeedsConfirmation(true);
            setIsSignUp(false); // Switch to login mode so they can try after clicking link
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      const msg = (err.message || "").toLowerCase();
      
      if (msg.includes("not confirmed") || msg.includes("email link is invalid")) {
          setError("Your email address has not been confirmed yet.");
          setNeedsConfirmation(true);
      } else if (msg.includes("invalid login credentials")) {
          setError("Invalid email or password.");
      } else if (msg.includes("user already registered")) {
          setError("This email is already registered. Please sign in.");
          setIsSignUp(false);
      } else {
          setError(err.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
        setError("Please enter your email address to resend the confirmation.");
        return;
    }
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email,
      });
      
      if (error) throw error;
      
      alert("Confirmation email resent! Please check your inbox (and spam folder).");
      setError("Confirmation email sent. Please check your inbox.");
    } catch (err: any) {
      console.error("Resend Error:", err);
      // Rate limit errors or others
      setError(err.message || "Failed to resend confirmation email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col justify-center items-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#007AFF] mb-2">💸 SmartSpend</h1>
          <p className="text-slate-500">Track your family expenses efficiently.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-[#007AFF]/20 focus:bg-white transition-all outline-none"
                placeholder="hello@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-[#007AFF]/20 focus:bg-white transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className={`text-sm p-3 rounded-lg flex flex-col gap-2 ${needsConfirmation ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-500'}`}>
                <span>{error}</span>
                {needsConfirmation && (
                    <button 
                        type="button" 
                        onClick={handleResendConfirmation}
                        disabled={loading}
                        className="text-left font-semibold underline hover:text-yellow-800 transition-colors"
                    >
                        {loading ? 'Sending...' : 'Resend Confirmation Email'}
                    </button>
                )}
              </div>
            )}

            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setNeedsConfirmation(false);
              }}
              className="text-sm text-[#007AFF] font-medium hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'New here? Create Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;