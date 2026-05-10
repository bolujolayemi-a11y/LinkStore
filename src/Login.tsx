import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/** * 🌐 VERCEL TO DENO CONFIG */
const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:8000" 
  : "https://linkstore.bolujolayemi-a11y.deno.net"; 

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
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
      // Construction ensures no double slashes
      const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         throw new Error("Deno response was not JSON. Check Dashboard Logs.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);

      if (data.success) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          navigate('/create');
        } else {
          setMessage("Account created! Sign in now. ✨");
          setIsLogin(true);
          setPassword('');
        }
      } else {
        setMessage(data.error || "Auth failed.");
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setMessage(err.message || "An unexpected error occurred. ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 antialiased font-sans">
      <motion.div layout className="w-full max-w-sm bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-black leading-none">LinkStore</h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-4">
            {isLogin ? 'Merchant Access' : 'Initialize Merchant Hub'}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none text-sm font-medium" />
            </div>
            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none text-sm font-medium pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>
          <button disabled={loading} className="w-full py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-[11px] shadow-xl disabled:bg-gray-200">
            {loading ? "Syncing..." : isLogin ? "Access Hub" : "Create Account"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-50 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] text-gray-400 font-black uppercase tracking-widest hover:text-black">
            {isLogin ? "New Merchant? Join Now" : "Returning? Access Hub"}
          </button>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 rounded-2xl bg-black text-white text-center">
              <p className="text-[10px] font-black uppercase tracking-widest">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}