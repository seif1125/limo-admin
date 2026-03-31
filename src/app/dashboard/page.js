"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { 
  User, Car, Calendar, Trash2, Globe, Phone, Settings, ChevronDown, 
  Search, MapPin, ExternalLink, TrendingUp, TrendingDown, Mail, 
  CreditCard, Layers, Zap, Info, PlusCircle, Expand, Timer, Navigation,
  ArrowUpRight, ArrowDownRight, Minus, Plus, Pencil
} from 'lucide-react';
import OverlayLoader from '@/components/loader';

export default function DashboardPage() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  // Updated Filter Logic: Name, Email, and Telephone
  useEffect(() => {
    const results = requests.filter(req => 
      req.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.phone1?.includes(searchTerm) || 
      req.car?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRequests(results);
  }, [searchTerm, requests]);

  const loadData = async () => {
    try {
      const res = await api.get('/rentals'); 
      setRequests(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const updateStatus = async (id, newStatus) => {
    setActionLoading(true);
    try {
      await api.put(`/rentals/${id}`, { status: newStatus });
      await loadData();
    } catch (err) { alert("Update failed"); } 
    finally { setActionLoading(false); }
  };

  const deleteRes = async (id) => {
    if(!window.confirm("Confirm permanent deletion?")) return;
    setActionLoading(true);
    try {
        await api.delete(`/rentals/${id}`);
        await loadData();
    } catch (err) { alert("Delete failed"); }
    finally { setActionLoading(false); }
  }

  // Live Stats Calculation
  const activeCount = requests.filter(r => r.status === 'active').length;
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const RateIndicator = ({ reserved, current }) => {
    if (reserved > current) return <div className="flex items-center gap-0.5 text-emerald-500 font-black"><ArrowUpRight size={12}/> <span className="text-[9px]">+{reserved - current}</span></div>;
    if (reserved < current) return <div className="flex items-center gap-0.5 text-rose-500 font-black"><ArrowDownRight size={12}/> <span className="text-[9px]">{reserved - current}</span></div>;
    return <div className="flex items-center gap-0.5 text-slate-400 font-black"><Minus size={12}/> <span className="text-[9px]">0</span></div>;
  };

  const thClass = "bg-slate-900 text-white p-4 text-[9px] font-black uppercase tracking-widest border-r border-slate-800";
  const tdClass = "p-4 text-xs font-bold text-slate-900 border-b border-slate-200 whitespace-nowrap";

  if (loading) return <OverlayLoader message="Analyzing Fleet Rates..." />;

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8">
      {actionLoading && <OverlayLoader message="Syncing Ledger..." />}
      
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
            <div>
                <h1 className="font-black text-4xl text-slate-900 uppercase tracking-tighter leading-none">Fleet Intelligence</h1>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Operations Command & Rate Audit</p>
            </div>

            <div className="flex items-center gap-4">
                {/* Active/Pending Counters */}
                <div className="bg-white border-2 border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-6 shadow-sm">
                    <div className="flex flex-col items-center">
                        <span className="text-blue-600 font-black text-xl">{activeCount}</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active</span>
                    </div>
                    <div className="w-px h-8 bg-slate-100"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-amber-500 font-black text-xl">{pendingCount}</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pending</span>
                    </div>
                </div>

                {/* Add New Button */}
                <Link href="/dashboard/reservation" className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-2 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
                    <Plus size={18} strokeWidth={3} />
                    New Reservation
                </Link>
            </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Filter by Name, Email, or Telephone..." 
            className="w-full bg-white pl-16 pr-6 py-5 rounded-[1.5rem] border-2 border-slate-200 outline-none font-bold text-sm shadow-sm focus:border-slate-900 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[2rem] border-2 border-slate-200 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse min-w-[3000px]">
              <thead>
                <tr>
                  <th className={`${thClass} w-[280px]`}>VIP Profile</th>
                  <th className={`${thClass} w-[220px]`}>Reserved Package</th>
                  <th className={`${thClass} w-[220px]`}>Base Rate Audit</th>
                  <th className={`${thClass} w-[300px]`}>KM Surcharge Audit</th>
                  <th className={`${thClass} w-[300px]`}>Hour Surcharge Audit</th>
                  <th className={`${thClass} w-[280px]`}>Revenue Breakdown</th>
                  <th className={`${thClass} w-[220px]`}>Payment Ledger</th>
                  <th className={`${thClass} w-[160px]`}>Trip Status</th>
                  <th className="bg-slate-900 p-4 w-[120px] text-center"><Settings size={14} className="text-white mx-auto" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => {
                  const car = req.car || {};
                  const live = car.rentalOptions || {};
                  const totalRev = (req.rate || 0) + (req.additionalPrice || 0);
                  const balance = totalRev - (req.cashDeposit || 0);

                  return (
                    <tr key={req._id} className="hover:bg-slate-50/50 transition-colors">
                      {/* 1. Profile */}
                      <td className={tdClass}>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-black tracking-tight">{req.customerName}</span>
                          <span className="text-[10px] text-slate-400 font-medium italic lowercase">{req.email}</span>
                          <div className="flex items-center gap-2 mt-1">
                             <Phone size={10} className="text-blue-500"/>
                             <span className="text-[10px] font-black text-slate-900">{req.phone1}</span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Package Specs */}
                      <td className={tdClass}>
                        <div className={`p-3 rounded-2xl border-2 flex flex-col gap-1 ${req.reservationType === 'Full Day' ? 'bg-purple-50 border-purple-100 text-purple-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                          <div className="flex items-center gap-2 font-black text-[10px] uppercase">
                             {req.reservationType === 'Full Day' ? <Zap size={14}/> : <MapPin size={14}/>} {req.reservationType}
                          </div>
                          <div className="text-[9px] font-bold opacity-80 bg-white/50 p-1 rounded-lg">
                            {req.fullDayHours}H Limit / {req.limitKilometers}KM Limit
                          </div>
                        </div>
                      </td>

                      {/* 3. Base Rate Audit */}
                      <td className={tdClass}>
                        <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                           <div className="flex justify-between items-center text-[10px]">
                              <span className="text-slate-400 font-black">RESERVED</span>
                              <span className="font-black">{req.rate?.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px]">
                              <span className="text-slate-400 font-black">MARKET</span>
                              <span className="text-slate-300 line-through font-bold">{car.price?.toLocaleString()}</span>
                           </div>
                           <div className="pt-2 border-t border-slate-200 flex justify-center">
                              <RateIndicator reserved={req.rate} current={car.price} />
                           </div>
                        </div>
                      </td>

                      {/* 4. KM Surcharge Audit */}
                      <td className={tdClass}>
                         <div className="grid grid-cols-2 gap-2 bg-slate-900 p-3 rounded-2xl text-white">
                            <div className="flex flex-col gap-1 border-r border-slate-800 pr-2">
                               <span className="text-[8px] text-slate-500 font-black uppercase">Usage</span>
                               <div className="flex items-center gap-1 text-emerald-400 font-black text-xs">
                                  <Navigation size={12}/> +{req.additionalKms || 0} <span className="text-[8px]">KM</span>
                               </div>
                            </div>
                            <div className="flex flex-col gap-1">
                               <div className="flex justify-between text-[9px] font-black">
                                  <span className="text-slate-500">RES:</span> <span>{req.extraKmCost}</span>
                               </div>
                               <div className="flex justify-between text-[9px] font-black">
                                  <span className="text-slate-500">NOW:</span> <span className="text-slate-400">{live.extraKmCost}</span>
                               </div>
                               <div className="mt-1 flex justify-end">
                                  <RateIndicator reserved={req.extraKmCost} current={live.extraKmCost} />
                               </div>
                            </div>
                         </div>
                      </td>

                      {/* 5. Hour Surcharge Audit */}
                      <td className={tdClass}>
                         <div className="grid grid-cols-2 gap-2 bg-slate-900 p-3 rounded-2xl text-white">
                            <div className="flex flex-col gap-1 border-r border-slate-800 pr-2">
                               <span className="text-[8px] text-slate-500 font-black uppercase">Usage</span>
                               <div className="flex items-center gap-1 text-blue-400 font-black text-xs">
                                  <Timer size={12}/> +{req.additionalHours || 0} <span className="text-[8px]">HR</span>
                               </div>
                            </div>
                            <div className="flex flex-col gap-1">
                               <div className="flex justify-between text-[9px] font-black">
                                  <span className="text-slate-500">RES:</span> <span>{req.extraHourCost}</span>
                               </div>
                               <div className="flex justify-between text-[9px] font-black">
                                  <span className="text-slate-500">NOW:</span> <span className="text-slate-400">{live.extraHourCost}</span>
                               </div>
                               <div className="mt-1 flex justify-end">
                                  <RateIndicator reserved={req.extraHourCost} current={live.extraHourCost} />
                               </div>
                            </div>
                         </div>
                      </td>

                      {/* 6. Revenue */}
                      <td className={tdClass}>
                        <div className="flex flex-col gap-1.5 bg-emerald-50/50 p-3 rounded-2xl border-2 border-emerald-100">
                           <div className="flex justify-between text-[10px] font-black text-slate-400">
                              <span>BASE:</span> <span className="text-slate-900">{req.rate?.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between text-[10px] font-black text-blue-600">
                              <span className="flex items-center gap-1"><PlusCircle size={10}/> EXTRAS:</span>
                              <span>{(req.additionalPrice || 0).toLocaleString()}</span>
                           </div>
                           <div className="h-px bg-emerald-200 my-1"></div>
                           <div className="flex justify-between text-xs font-black text-emerald-700">
                              <span className="flex items-center gap-1"><Expand size={12}/> TOTAL:</span>
                              <span>{totalRev.toLocaleString()}</span>
                           </div>
                        </div>
                      </td>

                      {/* 7. Ledger */}
                      <td className={tdClass}>
                         <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1 text-blue-600 font-black text-[10px] uppercase">
                               <CreditCard size={12}/> {req.paymentType}
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                               <span>PAID:</span> <span className="text-emerald-600">{req.cashDeposit?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm font-black text-red-600 border-t border-slate-100 pt-1">
                               <span>DUE:</span> <span>{balance.toLocaleString()}</span>
                            </div>
                         </div>
                      </td>

                      {/* 8. Status */}
                      <td className={tdClass}>
                         <div className="relative">
                            <select 
                              value={req.status} 
                              onChange={(e) => updateStatus(req._id, e.target.value)}
                              className={`w-full appearance-none px-4 py-3 rounded-xl text-[10px] font-black border-2 transition-all cursor-pointer ${
                                req.status === 'active' ? 'bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-100' : 
                                req.status === 'completed' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-amber-100 text-amber-700 border-amber-300'
                              }`}
                            >
                               <option value="pending">PENDING</option>
                               <option value="active">ACTIVE TRIP</option>
                               <option value="completed">COMPLETED</option>
                            </select>
                            <ChevronDown size={12} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${req.status !== 'pending' ? 'text-white' : 'text-amber-700'}`} />
                         </div>
                      </td>

                      {/* Action Cell */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                            {/* <Link href={`/dashboard/rentals/edit/${req._id}`} className="p-2.5 bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white rounded-xl transition-all shadow-sm">
                                <Pencil size={16} strokeWidth={2.5}/>
                            </Link> */}
                            <button onClick={() => deleteRes(req._id)} className="p-2.5 bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm">
                                <Trash2 size={16} strokeWidth={2.5}/>
                            </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #0f172a; border-radius: 20px; border: 3px solid #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
      `}</style>
    </div>
  );
}