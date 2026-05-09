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

/** * 🌐 SAME-ORIGIN CONFIG
 * Since we are hosting on Deno, we use window.location.origin 
 * to avoid CORS issues entirely.
 */
const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:8000" 
  : window.location.origin; 

export default function App() {
  const navigate = useNavigate();
  const [form, setForm] = useState<StoreForm>({ username: '', bio: '', links: [] });
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchExistingStore = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        const res = await fetch(`${API_BASE_URL}/api/get-store`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (isMounted && data.success && data.store) {
          setForm(data.store);
          setIsPro(data.store.isPro === true);
        }
      } catch (err) {
        console.error("Hub Sync Error ❌");
      }
    };
    fetchExistingStore();
    return () => { isMounted = false; };
  }, [navigate]);

  const addLink = () => {
    // 🛡️ LIMIT: Cap at 3 for Free users
    if (!isPro && form.links.length >= 3) {
      setMessage("Free Plan Limit: 3 Links. Upgrade to Pro! 🚀");
      setTimeout(() => setMessage(''), 4000);
      return;
    }
    setForm(prev => ({
      ...prev,
      links: [...prev.links, { platformName: '', url: '', source: 'Other' }]
    }));
  };

  const removeLink = (index: number) => {
    setForm(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const updateLink = <K extends keyof LinkItem>(index: number, field: K, value: LinkItem[K]) => {
    setForm(prev => {
      const updatedLinks = [...prev.links];
      updatedLinks[index] = { ...updatedLinks[index], [field]: value };
      return { ...prev, links: updatedLinks };
    });
  };

  const handleLaunch = async () => {
    if (!form.username) return setMessage("Username is required! ⚠️");
    if (form.links.length === 0) return setMessage("Add at least one source! 📦");
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/save-store`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (data.success) {
        const firstTime = localStorage.getItem('has_setup_once') === null;
        setMessage(firstTime ? "Hub Initialized! ✨" : "Hub Updated! ✨");
        setTimeout(() => {
          if (firstTime) {
            localStorage.setItem('has_setup_once', 'true');
            navigate('/pricing'); 
          } else {
            navigate('/dashboard'); 
          }
        }, 1500);
      } else {
        setMessage(data.error || "Sync Failed.");
      }
    } catch {
      setMessage("Hub is offline. Check connection. ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 antialiased font-sans">
      <motion.button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-all group">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110"><path d="m15 18-6-6 6-6"/></svg>
        Sign Out
      </motion.button>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-black">LinkStore</h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Source Configuration</p>
        </header>

        <div className="space-y-6">
          <div className="space-y-4">
            <input placeholder="Store Username" value={form.username} className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none text-sm font-medium" onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <textarea placeholder="Hub Description..." value={form.bio} className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none h-20 resize-none text-sm font-medium" onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sources ({form.links.length}/{isPro ? '∞' : '3'})</label>
              <button onClick={addLink} className="text-[10px] font-black text-black border-b-2 border-black">+ ADD SOURCE</button>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-3 scrollbar-hide pr-1">
              <AnimatePresence mode="popLayout">
                {form.links.map((link, index) => (
                  <motion.div layout key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="p-5 bg-gray-50 rounded-3xl space-y-4 border border-gray-100 group relative">
                    <button onClick={() => removeLink(index)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 font-bold text-[9px]">REMOVE</button>
                    <div className="flex flex-col gap-3">
                      <select value={link.source} onChange={(e) => updateLink(index, 'source', e.target.value as PlatformSource)} className="bg-white px-3 py-2 rounded-xl text-[10px] font-black outline-none border-none shadow-sm">
                        <option value="TikTok">TIKTOK</option><option value="Instagram">IG</option><option value="Shopify">SHOPIFY</option><option value="Bumpa">BUMPA</option><option value="WhatsApp">WHATSAPP</option><option value="Other">OTHER</option>
                      </select>
                      <input placeholder="Label (e.g. My Shop)" value={link.platformName} className="bg-transparent outline-none text-sm font-bold" onChange={(e) => updateLink(index, 'platformName', e.target.value)} />
                      <input placeholder="Paste Store URL" value={link.url} className="w-full bg-white px-4 py-3 rounded-xl text-[11px] outline-none border border-gray-50" onChange={(e) => updateLink(index, 'url', e.target.value)} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={handleLaunch} disabled={loading} className="w-full py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-[11px] shadow-lg disabled:bg-gray-200">
            {loading ? "Syncing..." : "Finalize Setup"}
          </motion.button>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 p-4 rounded-2xl bg-black text-white text-center shadow-lg">
              <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}