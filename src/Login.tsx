import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const endpoint = isLogin ? '/api/login' : '/api/register';
    
    try {
      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          // 🚀 SUCCESS: Take the merchant to the Hub Creator (App.tsx)
          navigate('/create');
        } else {
          setMessage("Account created! You can now sign in. ✨");
          setIsLogin(true);
        }
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch (_err) {
      setMessage("Server connection failed. ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 antialiased font-sans">
      
      {/* 🔙 BACK BUTTON: Takes user to Landing Page */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ x: -5 }}
        onClick={() => navigate('/')}
        className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-black transition-all group"
      >
        <svg 
          width="14" height="14" viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          className="transition-transform group-hover:scale-110"
        >
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back to Home
      </motion.button>

      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100"
      >
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-black leading-none">LinkStore</h1>
          <motion.p 
            key={isLogin ? 'signin' : 'signup'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-4"
          >
            {isLogin ? 'Merchant Access' : 'Create Merchant Account'}
          </motion.p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
              <input 
                type="email"
                required
                placeholder="name@store.com"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Password</label>
              <input 
                type="password"
                required
                placeholder="••••••••"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-[11px] shadow-xl shadow-black/10 transition-all disabled:bg-gray-200 mt-2"
          >
            {loading ? "Syncing..." : isLogin ? "Access Hub" : "Initialize Account"}
          </motion.button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-50 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] text-gray-400 font-black uppercase tracking-widest hover:text-black transition-colors"
          >
            {isLogin ? "New Merchant? Join Now" : "Returning? Access Hub"}
          </button>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 p-4 rounded-2xl bg-black text-white text-center shadow-lg"
            >
              <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}