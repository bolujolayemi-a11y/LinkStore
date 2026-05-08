import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

type PlatformSource = 'TikTok' | 'Instagram' | 'WhatsApp' | 'Shopify' | 'Bumpa' | 'Other';

interface LinkItem {
  platformName: string; 
  url: string;         
  source: PlatformSource;
}

interface StoreForm {
  username: string;
  bio: string;
  links: LinkItem[];
}

export default function App() {
  const navigate = useNavigate();
  const [form, setForm] = useState<StoreForm>({ 
    username: '', 
    bio: '', 
    links: [] 
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 🔄 Sync: Load existing record if it exists in KV
  useEffect(() => {
    const fetchExistingStore = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch("http://localhost:8000/api/get-store", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.store) {
          setForm(data.store);
        }
      } catch (err) {
        console.error("Failed to pre-sync store data");
      }
    };
    fetchExistingStore();
  }, []);

  const addLink = () => {
    setForm({
      ...form,
      links: [...form.links, { platformName: '', url: '', source: 'Other' }]
    });
  };

  const removeLink = (index: number) => {
    const updatedLinks = form.links.filter((_, i) => i !== index);
    setForm({ ...form, links: updatedLinks });
  };

  const updateLink = <K extends keyof LinkItem>(index: number, field: K, value: LinkItem[K]) => {
    const updatedLinks = [...form.links];
    updatedLinks[index][field] = value;
    setForm({ ...form, links: updatedLinks });
  };

  const handleLaunch = async () => {
    if (!form.username) return setMessage("Username is required! ⚠️");
    if (form.links.length === 0) return setMessage("Add at least one store source! 📦");
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:8000/api/save-store", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });
      
      const data = await response.json();
      
      if (data.success) {
        const isFirstTime = localStorage.getItem('has_setup_once') === null;
        setMessage(isFirstTime ? "Hub Initialized! Viewing Plans... ✨" : "Hub Updated! Entering Dashboard... ✨");
        
        setTimeout(() => {
          if (isFirstTime) {
            localStorage.setItem('has_setup_once', 'true');
            navigate('/pricing'); 
          } else {
            navigate('/dashboard'); 
          }
        }, 1500);
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch (_err) {
      setMessage("Could not connect to Deno server. ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 antialiased font-sans"
    >
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ x: -4 }}
        onClick={() => navigate('/login')}
        className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-all group"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back to Access
      </motion.button>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-black leading-none">LinkStore</h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic">Source Configuration</p>
        </header>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Store Username</label>
              <input 
                placeholder="enter your store name"
                value={form.username}
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-medium text-sm"
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hub Description</label>
              <textarea 
                placeholder="Centralize your TikTok & IG orders..."
                value={form.bio}
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all h-20 resize-none text-sm font-medium"
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Connect Sources</label>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addLink} 
                className="text-[10px] font-black text-black border-b-2 border-black pb-0.5"
              >
                + ADD SOURCE
              </motion.button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3 pr-1 scrollbar-hide">
              <AnimatePresence mode="popLayout">
                {form.links.map((link, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={index} 
                    className="p-5 bg-gray-50 rounded-3xl space-y-4 border border-gray-100 group relative"
                  >
                    <button 
                      onClick={() => removeLink(index)}
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 font-bold text-[9px] tracking-widest"
                    >
                      REMOVE
                    </button>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <select 
                          className="bg-white px-3 py-2 rounded-xl text-[10px] font-black shadow-sm outline-none border-none appearance-none cursor-pointer"
                          value={link.source}
                          onChange={(e) => updateLink(index, 'source', e.target.value as PlatformSource)}
                        >
                          <option value="TikTok">TIKTOK</option>
                          <option value="Instagram">IG</option>
                          <option value="Shopify">SHOPIFY</option>
                          <option value="Bumpa">BUMPA</option>
                          <option value="WhatsApp">WHATSAPP</option>
                          <option value="Other">OTHER</option>
                        </select>
                        <input 
                          placeholder="Label (e.g. My TikTok Shop)"
                          value={link.platformName}
                          className="flex-1 bg-transparent border-none outline-none text-sm font-bold placeholder:text-gray-300"
                          onChange={(e) => updateLink(index, 'platformName', e.target.value)}
                        />
                      </div>
                      <input 
                        placeholder="Paste Store URL"
                        value={link.url}
                        className="w-full bg-white px-4 py-3 rounded-xl text-[11px] font-medium outline-none border border-gray-50 focus:border-black transition-colors"
                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            onClick={handleLaunch}
            disabled={loading}
            className="w-full py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-[11px] hover:shadow-2xl transition-all active:scale-95 disabled:bg-gray-200 shadow-black/20"
          >
            {loading ? "Syncing Hub..." : "Finalize Setup"}
          </motion.button>
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
      </div>
    </motion.div>
  );
}