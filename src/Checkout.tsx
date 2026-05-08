import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Redirect to dashboard after success
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 antialiased font-sans">
      
      {/* 🔙 Back to Pricing */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => navigate('/pricing')}
        className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-black transition-all"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
                  <span className="text-4xl font-black italic tracking-tighter text-black">₦2,500</span>
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-tighter">/monthly</span>
                </div>
              </header>

              <form onSubmit={handlePayment} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5 px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cardholder Name</label>
                    <input 
                      required
                      placeholder="Jolayemi Boluwatife"
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-1.5 px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Card Number</label>
                    <div className="relative">
                      <input 
                        required
                        placeholder="0000 0000 0000 0000"
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 px-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Expiry</label>
                      <input placeholder="MM/YY" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-mono" />
                    </div>
                    <div className="space-y-1.5 px-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">CVC</label>
                      <input placeholder="•••" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-mono" />
                    </div>
                  </div>
                </div>

                <motion.button 
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-[11px] shadow-xl shadow-black/10 transition-all disabled:bg-gray-200 mt-2"
                >
                  {loading ? "Verifying..." : "Complete Payment"}
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
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-black italic tracking-tighter uppercase text-black">Payment Successful</h2>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Welcome to LinkStore Pro</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}