import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/** * 🌐 SMART URL SWITCHING 
 * Updated for the Full-Stack Deno deployment
 */
const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:8000" 
  : window.location.origin; 

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false); // 👁️ Eye state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const endpoint = isLogin ? 'api/login' : 'api/register';
    
    try {
      const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(),
          password 
        }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         throw new Error("Server response error. Check logs.");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}`);
      }

      if (data.success) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          navigate('/create');
        } else {
          setMessage("Account created! Access your hub now. ✨");
          setIsLogin(true);
          setPassword('');
        }
      } else {
        setMessage(data.error || "Authentication failed.");
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.message.includes("Failed to fetch")) {
        setMessage("Hub unreachable. Check connection. ❌");
      } else {
        setMessage(err.message || "An unexpected error occurred. ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 antialiased font-sans">
      
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ x: -5 }}
        onClick={() => navigate('/')}
        className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-black transition-all group"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Home
      </motion.button>

      <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-black leading-none">LinkStore</h1>
          <motion.p key={isLogin ? 'signin' : 'signup'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-4">
            {isLogin ? 'Merchant Access' : 'Initialize Merchant Hub'}
          </motion.p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            {/* EMAIL */}
            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
              <input type="email" required placeholder="name@store.com" value={email} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium" onChange={(e) => setEmail(e.target.value)} />
            </div>

            {/* PASSWORD WITH EYE TOGGLE */}
            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  placeholder="••••••••" 
                  value={password} 
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium pr-12" 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black transition-colors"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88L14.12 14.12M17.36 17.36L20.5 20.5M15.42 15.42C14.59 15.8 13.62 16 12 16C8.69 16 6 13.31 6 10C6 8.38 6.2 7.41 6.58 6.58M11.24 4.55C11.49 4.52 11.74 4.5 12 4.5C16.42 4.5 20 8.08 20 12.5C20 12.76 19.98 13.01 19.45 13.76M1 1L23 23"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} disabled={loading} className="w-full py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-[11px] shadow-xl shadow-black/10 transition-all disabled:bg-gray-200 mt-2">
            {loading ? "Syncing..." : isLogin ? "Access Hub" : "Create Account"}
          </motion.button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-50 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] text-gray-400 font-black uppercase tracking-widest hover:text-black transition-colors">
            {isLogin ? "New Merchant? Join Now" : "Returning? Access Hub"}
          </button>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 p-4 rounded-2xl bg-black text-white text-center shadow-lg">
              <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}