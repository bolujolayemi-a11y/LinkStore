import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// 🆕 Updated Status types for better logistics tracking
interface Order {
  id: string;
  customerName: string;
  productName: string;
  amount: string;
  source: string; 
  status: 'Pending' | 'Paid' | 'Awaiting Delivery' | 'Delivered';
  timestamp: string;
}

interface StoreConfig {
  username: string;
  bio: string;
  links: { platformName: string; url: string; source: string }[];
  isPro?: boolean;
}

const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:8000" 
  : "https://linkstore.bolujolayemi-a11y.deno.net"; 

export default function Dashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState<'orders' | 'settings'>('orders');
  const [store, setStore] = useState<StoreConfig | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const syncHubData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/get-store`, {
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
        });
        const data = await response.json();

        if (isMounted) {
          if (data.success) {
            setStore(data.store);
            const orderRes = await fetch(`${API_BASE_URL}/api/orders`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            const orderData = await orderRes.json();
            if (orderData.success) setOrders(orderData.orders);
          } else {
            navigate('/create');
          }
        }
      } catch (err) {
        console.error("Dashboard Sync Error ❌:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    syncHubData();
    return () => { isMounted = false; };
  }, [navigate]);

  const dynamicSources = store ? ['All', ...new Set(store.links.map(link => link.source))] : ['All'];
  const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.source === filter);

  // 🎨 HELPER: Get Status Badge Colors
  const getStatusStyle = (status: Order['status']) => {
    switch (status) {
      case 'Paid': return 'text-green-500 bg-green-50';
      case 'Awaiting Delivery': return 'text-blue-500 bg-blue-50';
      case 'Delivered': return 'text-gray-400 bg-gray-50';
      case 'Pending': 
      default: return 'text-orange-400 bg-orange-50';
    }
  };

  if (loading && !store) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc]">
      <motion.p animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
        Syncing Hub...
      </motion.p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#fcfcfc] p-4 md:p-8 font-sans antialiased overflow-x-hidden">
      <div className="max-w-5xl mx-auto">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6">
          <motion.div layout>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-black leading-none">
                Welcome, {store?.username || 'Merchant'}
              </h1>
              <span className={`px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest ${store?.isPro ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                {store?.isPro ? 'Pro' : 'Free Tier'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
               <p className="text-gray-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] italic">
                {view === 'orders' ? 'Logistics Overview' : 'Hub Configuration'}
              </p>
            </div>
          </motion.div>
          
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <nav className="flex gap-1 bg-gray-100 p-1 rounded-2xl border border-gray-200/50">
              <button onClick={() => setView('orders')} className={`px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${view === 'orders' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Orders</button>
              <button onClick={() => setView('settings')} className={`px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${view === 'settings' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Settings</button>
            </nav>
            <button onClick={() => { localStorage.removeItem('token'); navigate('/'); }} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {view === 'orders' ? (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {dynamicSources.map(s => (
                  <button key={s} onClick={() => setFilter(s)} className={`px-5 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${filter === s ? 'bg-black border-black text-white shadow-lg shadow-black/10' : 'bg-white border-gray-100 text-gray-400'}`}>
                    {s}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-4xl md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left min-w-175 md:min-w-full">
                    <thead>
                      <tr className="border-b border-gray-50 text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-gray-300 font-black">
                        <th className="px-6 md:px-8 py-5 md:py-6 w-20">ID</th>
                        <th className="px-6 md:px-8 py-5 md:py-6">Customer</th>
                        <th className="px-6 md:px-8 py-5 md:py-6">Source</th>
                        <th className="px-6 md:px-8 py-5 md:py-6 text-center">Status</th>
                        <th className="px-6 md:px-8 py-5 md:py-6 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 md:px-8 py-5 md:py-6 text-[9px] md:text-[10px] font-mono text-gray-300">#{order.id.slice(-4)}</td>
                          <td className="px-6 md:px-8 py-5 md:py-6 font-bold text-black text-xs md:text-sm">{order.customerName}</td>
                          <td className="px-6 md:px-8 py-5 md:py-6">
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tighter text-gray-400 px-3 py-1 bg-gray-100 rounded-full">{order.source}</span>
                          </td>
                          <td className="px-6 md:px-8 py-5 md:py-6 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 md:px-8 py-5 md:py-6 text-right font-mono font-bold text-black text-xs md:text-sm">{order.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredOrders.length === 0 && (
                  <div className="py-24 md:py-32 text-center">
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-200 italic">No activity for {filter}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              
              <div className="bg-white p-8 md:p-10 rounded-4xl md:rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-8">Hub Identity</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Current Tier</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs md:text-sm font-bold text-black uppercase">{store?.isPro ? 'Professional' : 'Standard (Free)'}</p>
                      {!store?.isPro && (
                        <button onClick={() => navigate('/pricing')} className="text-[9px] font-black text-green-500 underline underline-offset-2 uppercase tracking-tighter">Upgrade</button>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Username</p>
                    <p className="text-base md:text-lg font-bold text-black italic tracking-tighter">{store?.username || 'Merchant'}</p>
                  </div>
                  <button onClick={() => navigate('/create')} className="w-full py-4 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-all">
                    Update Hub Config
                  </button>
                </div>
              </div>

              <div className="bg-white p-8 md:p-10 rounded-4xl md:rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-8">Active Channels</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                  {store?.links.map((link, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                      <div>
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest block text-black">{link.source}</span>
                        <span className="text-[8px] md:text-[9px] text-gray-400 font-bold">{link.platformName}</span>
                      </div>
                      <a href={link.url} target="_blank" rel="noreferrer" className="text-[9px] font-black text-black uppercase underline underline-offset-4 opacity-30 group-hover:opacity-100 transition-all">Visit</a>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}