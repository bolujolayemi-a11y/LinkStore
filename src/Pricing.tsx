import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: "Free",
    monthly: 0,
    yearly: 0,
    features: ["Up to 3 Links", "Basic Analytics", "Standard Theme", "TikTok/IG Integration"],
    cta: "Get Started",
    path: "/dashboard", 
    popular: false
  },
  {
    name: "Pro",
    monthly: 3000,
    yearly: 30000,
    features: ["Unlimited Links", "Advanced Order Hub", "Custom Branding", "Priority Support"],
    cta: "Go Pro",
    path: "/checkout", 
    popular: true
  },
  {
    name: "Enterprise",
    monthly: 8000,
    yearly: 75000,
    features: ["Multiple Sub-accounts", "API Access", "Custom Domain", "Dedicated Manager"],
    cta: "Contact Sales",
    path: "mailto:sales@linkstore.com", 
    popular: false
  }
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();

  const handlePlanSelection = (path: string) => {
    // 1. Check for the Merchant Token
    const token = localStorage.getItem('token');

    // 2. Handle External Links (Sales/Email)
    if (path.startsWith('mailto:') || path.startsWith('http')) {
      window.location.href = path;
      return;
    }

    // 3. AUTH GUARD: Redirect to login if no token exists
    if (!token) {
      navigate('/login');
      return;
    }

    // 4. LOGGED IN: Proceed to Dashboard or Checkout
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center py-20 px-6 antialiased font-sans">
      
      {/* 🔙 BACK NAVIGATION */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ x: -4 }}
        onClick={() => navigate(-1)}
        className="mb-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-black transition-all group"
      >
        <svg 
          width="14" height="14" viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          className="transition-transform group-hover:scale-110"
        >
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back
      </motion.button>

      <div className="max-w-5xl w-full mx-auto">
        <header className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black italic tracking-tighter uppercase text-black"
          >
            Scale Your Store
          </motion.h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-4 italic">Step 4: Select Your Growth Plan</p>

          {/* TOGGLE: Monthly / Yearly */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${!isYearly ? 'text-black' : 'text-gray-400'}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="w-12 h-6 bg-gray-200 rounded-full p-1 relative transition-colors focus:outline-none"
            >
              <motion.div 
                animate={{ x: isYearly ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-4 h-4 bg-black rounded-full shadow-sm"
              />
            </button>
            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isYearly ? 'text-black' : 'text-gray-400'}`}>
              Yearly <span className="ml-1 text-green-500 font-black">(-20%)</span>
            </span>
          </div>
        </header>

        {/* PRICING GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div 
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-[2.5rem] bg-white border transition-shadow ${plan.popular ? 'border-black shadow-2xl shadow-black/5' : 'border-gray-100 shadow-sm'}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                  Most Popular
                </span>
              )}

              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">{plan.name}</h3>
              
              <div className="mt-4 flex items-baseline gap-1 overflow-hidden h-10">
                <span className="text-4xl font-black italic tracking-tighter flex items-center">
                  ₦
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isYearly ? 'yearly' : 'monthly'}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isYearly ? plan.yearly.toLocaleString() : plan.monthly.toLocaleString()}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className="text-gray-400 text-xs font-bold uppercase tracking-tighter">
                  /{isYearly ? 'yr' : 'mo'}
                </span>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-xs font-medium text-gray-600">
                    <div className="size-1 bg-black rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handlePlanSelection(plan.path)}
                className={`w-full mt-10 py-4 rounded-full font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 ${plan.popular ? 'bg-black text-white shadow-lg shadow-black/20' : 'bg-gray-50 text-black hover:bg-gray-100'}`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}