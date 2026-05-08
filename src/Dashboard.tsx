import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Order {
  id: string;
  customerName: string;
  productName: string;
  amount: string;
  source: string; 
  status: 'Pending' | 'Paid' | 'Shipped';
  timestamp: string;
}

interface StoreConfig {
  username: string;
  bio: string;
  links: { platformName: string; url: string; source: string }[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState<'orders' | 'settings'>('orders');
  const [store, setStore] = useState<StoreConfig | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncHubData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/api/get-store", {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        const data = await response.json();

        if (data.success) {
          setStore(data.store);
          // If the backend also sends orders in the same call or a separate one:
          setOrders(data.orders || []);
        } else {
          console.warn("Store not found, redirecting to creator...");
          navigate('/create');
        }
      } catch (_err) {
        console.error("Sync failed ❌");
      } finally {
        setLoading(false);
      }
    };

    syncHubData();
  }, [navigate]);

  const dynamicSources = store 
    ? ['All', ...new Set(store.links.map(link => link.source))] 
    : ['All'];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.source === filter);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc]">
      <motion.p 
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400"
      >
        Syncing with Hub...
      </motion.p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#fcfcfc] p-8 font-sans antialiased"
    >
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <motion.div layout>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-black leading-none">
              Welcome, {store?.username}
            </h1>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 italic">
              {view === 'orders' ? 'Logistics Overview' : 'Hub Settings'}
            </p>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <nav className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
              <button 
                onClick={() => setView('orders')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'orders' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
              >
                Orders
              </button>
              <button 
                onClick={() => setView('settings')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'settings' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
              >
                Settings
              </button>
            </nav>
            <button onClick={handleLogout} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {view === 'orders' ? (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {dynamicSources.map(s => (
                  <button 
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${filter === s ? 'bg-black border-black text-white' : 'bg-white border-gray-100 text-gray-400'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-50 text-[9px] uppercase tracking-[0.2em] text-gray-300 font-black">
                      <th className="px-8 py-6">Customer</th>
                      <th className="px-8 py-6">Product</th>
                      <th className="px-8 py-6">Source</th>
                      <th className="px-8 py-6 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6 font-bold text-black text-sm">{order.customerName}</td>
                        <td className="px-8 py-6 text-gray-500 text-xs font-medium">{order.productName}</td>
                        <td className="px-8 py-6">
                          <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">{order.source}</span>
                        </td>
                        <td className="px-8 py-6 text-right font-mono font-bold text-black">{order.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredOrders.length === 0 && (
                  <div className="py-32 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-200 italic">No activity recorded for {filter}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Profile Overview */}
              <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-8">Profile Identity</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Username</p>
                    <p className="text-lg font-bold text-black italic tracking-tighter">{store?.username}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Bio</p>
                    <p className="text-sm font-medium text-gray-600 leading-relaxed">{store?.bio || 'No description provided.'}</p>
                  </div>
                  <button 
                    onClick={() => navigate('/create')}
                    className="w-full py-4 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-all"
                  >
                    Edit Hub Config
                  </button>
                </div>
              </div>

              {/* Connected Channels */}
              <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-8">Connected Channels</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {store?.links.map((link, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest block text-black">{link.source}</span>
                        <span className="text-[9px] text-gray-400 font-bold lowercase tracking-tight">{link.platformName}</span>
                      </div>
                      <a href={link.url} target="_blank" rel="noreferrer" className="text-[9px] font-black text-black uppercase underline underline-offset-4 hover:text-gray-400 transition-colors">Visit</a>
                    </div>
                  ))}
                  {(!store?.links || store.links.length === 0) && (
                    <p className="text-[10px] font-black uppercase text-gray-300 text-center py-10">No channels linked</p>
                  )}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}