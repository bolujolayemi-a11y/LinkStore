import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/** * 🌐 SAME-ORIGIN CONFIG 
 * Updated for the Full-Stack Deno host.
 */
const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:8000" 
  : window.location.origin; 

export default function Checkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('token');

    if (!token) {
      setError("Session expired. Please log in again.");
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/update-subscription`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          plan: 'Pro',
          status: 'Active' 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Payment sync failed.");
      }

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // 🚀 Briefly wait so the user sees the success state
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(data.error || "Payment sync failed.");
      }
    } catch (err: any) {
      console.error("Payment Error:", err);
      setError("Payment sync failed. Check your connection. ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 antialiased font-sans">
      
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => navigate('/pricing')}
        className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-black transition-all group"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Change Plan
      </motion.button>

      <motion.div 
        layout
        className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <header className="mb-10">
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Upgrade to Pro</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-black italic tracking-tighter text-black">₦3,000</span>
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-tighter">/monthly</span>
                </div>
              </header>

              <form onSubmit={handlePayment} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5 px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cardholder Name</label>
                    <input 
                      required
                      placeholder="Full Name"
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-1.5 px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Card Number</label>
                    <input required placeholder="0000 0000 0000 0000" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-mono" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 px-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Expiry</label>
                      <input required placeholder="MM/YY" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-mono" />
                    </div>
                    <div className="space-y-1.5 px-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">CVC</label>
                      <input required placeholder="•••" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-mono" />
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-[10px] font-black uppercase text-red-500 text-center">{error}</p>
                )}

                <motion.button 
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-[11px] shadow-xl shadow-black/10 transition-all disabled:bg-gray-200 mt-2"
                >
                  {loading ? "Syncing Hub..." : "Complete Payment"}
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 text-center"
            >
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-black/20">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-black italic tracking-tighter uppercase text-black leading-none">Payment Successful</h2>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-4 italic">Account Activated</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}