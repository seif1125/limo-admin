"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Clock, CheckCircle, User, Car, Calendar, Trash2, Globe, Phone, Activity, Settings, ChevronDown, Plus, Search } from 'lucide-react';
import OverlayLoader from '@/components/loader';

export default function DashboardPage() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ pending: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const results = requests.filter(req => 
      req.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.phone1?.includes(searchTerm) ||
      req.car?.name?.en?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRequests(results);
  }, [searchTerm, requests]);

  const loadData = async () => {
    try {
      // Ensure this endpoint is consistent with your backend
      const res = await api.get('/rentals'); 
      setRequests(res.data);
      const pending = res.data.filter(r => r.status === 'pending').length;
      const active = res.data.filter(r => r.status === 'active').length;
      setStats({ pending, active });
    } catch (err) {
      console.error("Load failed", err);
    } finally { setLoading(false); }
  };

  const updateStatus = async (id, currentStatus, newStatus) => {
    // Prevent update if already active (per your request)
    if (currentStatus === 'active') return;

    setActionLoading(true);
    try {
      // FIXED ENDPOINT: Ensure this matches your backend route exactly
      // If /rentals is your GET, your PUT might be /rentals/status/:id or /reservations/status/:id
      await api.put(`/rentals/status/${id}`, { status: newStatus });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Status update failed (Check if route /api/rentals/status/:id exists)");
    } finally { setActionLoading(false); }
  };

  const deleteRes = async (id) => {
    if (!window.confirm("Delete this reservation permanently?")) return;
    setActionLoading(true);
    try {
      await api.delete(`/rentals/${id}`);
      await loadData();
    } catch (err) {
      alert("Delete failed");
    } finally { setActionLoading(false); }
  };

  const thClass = "bg-slate-900 text-white p-4 text-[11px] font-black uppercase tracking-wider border-r border-slate-800";
  const tdClass = "p-4 text-sm font-bold text-slate-900 border-b border-slate-200 whitespace-nowrap";

  if (loading) return <OverlayLoader message="Syncing Dashboard..." />;

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:p-8">
      {actionLoading && <OverlayLoader message="Updating..." />}
      
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-2xl border-2 border-slate-300 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6 shadow-sm">
          <div>
            <h1 className="font-black text-2xl md:text-3xl text-slate-900 m-0 tracking-tighter uppercase tracking-widest">VIP Reservations</h1>
            <p className="m-0 text-slate-500 text-xs font-bold tracking-widest mt-1 uppercase">Live Fleet & Booking Management</p>
          </div>
          <button 
            className="w-full lg:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-xl font-black text-xs hover:bg-blue-600 transition-all shadow-lg active:scale-95"
            onClick={() => window.location.href = '/dashboard/reserve'}
          >
            <Plus size={18} /> NEW RESERVATION
          </button>
        </div>

        {/* Search & Stats Row */}
        <div className="flex flex-col xl:flex-row gap-4 mb-6">
          <div className="relative flex-1 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name, email, phone or car..." 
              className="w-full bg-white pl-12 pr-4 py-4 rounded-xl border-2 border-slate-300 outline-none font-bold text-sm text-slate-900 focus:border-slate-900 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
            <div className="bg-white px-6 py-4 rounded-xl border-2 border-slate-300 flex items-center gap-3 min-w-[160px] flex-1 md:flex-none shadow-sm">
              <div className="bg-amber-100 p-2 rounded-lg"><Clock size={18} className="text-amber-700" /></div>
              <span className="text-[11px] font-black text-slate-900 uppercase leading-none">{stats.pending} <br/><span className="text-slate-400 text-[9px]">Pending</span></span>
            </div>
            <div className="bg-white px-6 py-4 rounded-xl border-2 border-slate-300 flex items-center gap-3 min-w-[160px] flex-1 md:flex-none shadow-sm">
              <div className="bg-emerald-100 p-2 rounded-lg"><CheckCircle size={18} className="text-emerald-700" /></div>
              <span className="text-[11px] font-black text-slate-900 uppercase leading-none">{stats.active} <br/><span className="text-slate-400 text-[9px]">Active</span></span>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl border-2 border-slate-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse min-w-[1400px]">
              <thead>
                <tr>
                  <th className={`${thClass} w-[280px]`}><div className="flex items-center gap-2"><User size={14} /> Customer</div></th>
                  <th className={`${thClass} w-[300px]`}><div className="flex items-center gap-2"><Phone size={14} /> Contact</div></th>
                  <th className={`${thClass} w-[140px]`}><div className="flex items-center gap-2"><Globe size={14} /> Nationality</div></th>
                  <th className={`${thClass} w-[200px]`}><div className="flex items-center gap-2"><Car size={14} /> Vehicle</div></th>
                  <th className={`${thClass} w-[250px]`}><div className="flex items-center gap-2"><Calendar size={14} /> Period</div></th>
                  <th className={`${thClass} w-[160px]`}><div className="flex items-center gap-2"><Activity size={14} /> Status</div></th>
                  <th className="bg-slate-900 text-white p-4 w-[80px] text-center"><Settings size={14} className="mx-auto" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50 transition-colors">
                    <td className={tdClass}>
                      <div className="flex flex-col">
                        <span>{req.customerName}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{req.email}</span>
                      </div>
                    </td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs">{req.phone1}</span>
                        {req.phone2 && <span className="text-slate-300 font-light">|</span>}
                        {req.phone2 && <span className="text-slate-400 text-xs">{req.phone2}</span>}
                      </div>
                    </td>
                    <td className={tdClass}>{req.nationality}</td>
                    <td className={tdClass}>
                      <span className="text-blue-600 font-black tracking-tight">{req.car?.name?.en || 'N/A'}</span>
                    </td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="bg-slate-900 text-white px-2 py-1 rounded-md">{new Date(req.fromDate).toLocaleDateString()}</span>
                        <span className="text-slate-300 font-black">→</span>
                        <span className="bg-slate-900 text-white px-2 py-1 rounded-md">{new Date(req.toDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className={tdClass}>
                      <div className="relative group">
                        <select 
                          value={req.status} 
                          disabled={req.status === 'active'} // Disable if already active
                          onChange={(e) => updateStatus(req._id, req.status, e.target.value)}
                          className={`w-full appearance-none px-4 py-2 rounded-lg text-[10px] font-black text-center outline-none border transition-all ${
                            req.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default shadow-none' 
                              : 'bg-amber-50 text-amber-700 border-amber-200 cursor-pointer hover:bg-amber-100'
                          }`}
                        >
                          <option value="pending">PENDING</option>
                          <option value="active">SET AS ACTIVE</option>
                        </select>
                        {/* Only show the chevron if the user can actually interact with it */}
                        {req.status !== 'active' && (
                           <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => deleteRes(req._id)} 
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredRequests.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-4 bg-white">
              <Search size={40} className="text-slate-200" />
              <div className="flex flex-col gap-1">
                <span className="text-slate-900 font-black uppercase tracking-widest text-sm">No reservations found</span>
                <p className="text-slate-400 text-xs font-bold uppercase">Try searching for a different name, email, or car model.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; border: 2px solid #ffffff; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
      `}</style>
    </div>
  );
}