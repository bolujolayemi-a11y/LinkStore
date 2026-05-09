import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuLinks = [
    { name: 'Pricing', path: '/pricing' },
    { name: 'Access Hub', path: '/login' },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans antialiased overflow-x-hidden">
      
      {/* 🧭 NAVIGATION */}
      <nav className="flex justify-between items-center px-6 md:px-8 py-6 md:py-8 max-w-7xl mx-auto relative z-50">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl md:text-2xl font-black italic tracking-tighter uppercase cursor-pointer"
          onClick={() => navigate('/')}
        >
          LinkStore
        </motion.h1>
        
        {/* DESKTOP LINKS */}
        <div className="hidden md:flex gap-10 items-center">
          <button onClick={() => navigate('/pricing')} className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors">Pricing</button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')} 
            className="px-8 py-3 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-black/10 transition-all"
          >
            Get Started
          </motion.button>
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex items-center gap-3 group"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">
            {isMenuOpen ? 'Close' : 'Menu'}
          </span>
          <div className="flex flex-col gap-1.5">
            <motion.div 
              animate={isMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              className="w-6 h-0.5 bg-black" 
            />
            <motion.div 
              animate={isMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
              className="w-6 h-0.5 bg-black" 
            />
          </div>
        </button>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center p-10 md:hidden"
          >
            <div className="flex flex-col gap-8 text-center">
              {menuLinks.map((link, i) => (
                <motion.button
                  key={link.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate(link.path);
                  }}
                  className="text-4xl font-black italic tracking-tighter uppercase text-black hover:text-gray-300 transition-colors"
                >
                  {link.name}
                </motion.button>
              ))}
              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => { setIsMenuOpen(false); navigate('/login'); }}
                className="mt-4 px-10 py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-[11px]"
              >
                Start Free Hub
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="px-6 pt-16 md:pt-24 pb-24 md:pb-32 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="px-5 py-2 bg-gray-100 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">
            Social Commerce OS
          </span>
          <h2 className="text-5xl sm:text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.9] md:leading-[0.85] mt-8 md:mt-10 mb-8 md:mb-12">
            One Link. <br /> 
            <span className="text-gray-200">Total Control.</span>
          </h2>
          <p className="max-w-xl md:max-w-2xl mx-auto text-gray-400 text-base md:text-xl font-medium leading-relaxed mb-10 md:mb-14">
            The logistics layer for social sellers. Sync your TikTok, Instagram, and Shopify stores into a single high-taste order hub.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-5 justify-center items-center">
            <motion.button 
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-10 md:px-12 py-5 md:py-6 bg-black text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] shadow-2xl shadow-black/20 transition-all"
            >
              Start Your Hub Free
            </motion.button>
            <button 
              onClick={() => navigate('/pricing')}
              className="w-full sm:w-auto px-10 md:px-12 py-5 md:py-6 bg-transparent border-2 border-gray-100 text-gray-400 rounded-full font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] hover:border-black hover:text-black transition-all"
            >
              View Plans
            </button>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="bg-white py-24 md:py-40 border-y border-gray-50 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-20">
          {[
            {
              title: "Unified Inventory",
              desc: "Manage TikTok and IG stock in one place. No more double-selling.",
              icon: "📦"
            },
            {
              title: "Revenue Tracking",
              desc: "Know exactly which post triggered which sale with deep attribution.",
              icon: "📊"
            },
            {
              title: "Instant Checkout",
              desc: "A brutalist, high-speed interface that converts followers into customers.",
              icon: "⚡"
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="group"
            >
              <div className="text-4xl md:text-5xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-500">{feature.icon}</div>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic mb-4 leading-none">{feature.title}</h3>
              <p className="text-gray-400 font-medium leading-relaxed text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 text-center border-t border-gray-50 bg-white">
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-gray-200">
          LinkStore — The Merchant Standard
        </p>
      </footer>
    </div>
  );
}