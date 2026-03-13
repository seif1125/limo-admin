"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api'; 
import { Trash2, Edit3, MessageSquare, User } from 'lucide-react';
import OverlayLoader from '@/components/loader';

export default function TestimonialsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/testimonials');
      setItems(res.data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    
    setActionLoading(true);
    setStatusMsg("Removing testimonial...");
    try {
      await api.delete(`/testimonials/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      alert("Delete failed.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <OverlayLoader message="Loading Testimonials..." />;

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:p-6 w-full overflow-x-hidden box-border">
      {actionLoading && <OverlayLoader message={statusMsg} />}

      <div className="max-w-full mx-auto">
        
        {/* Responsive Header */}
        <div className="bg-white p-5 md:p-6 rounded-xl border-2 border-slate-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <MessageSquare className="text-slate-900" size={28} />
              <h1 className="font-black text-xl md:text-2xl m-0 text-slate-900 tracking-tighter uppercase">
                Testimonials
              </h1>
            </div>
            <p className="m-0 mt-1 text-slate-500 text-xs font-bold tracking-wider">
              TOTAL REVIEWS: {items.length}
            </p>
          </div>
          
          <Link 
            href="/dashboard/testimonials/add" 
            className="w-full md:w-auto text-center bg-slate-900 hover:bg-blue-700 text-white px-6 py-3 rounded-lg no-underline font-black text-xs transition-colors uppercase tracking-widest"
          >
            + Add Testimonial
          </Link>
        </div>

        {/* Scrollable Table Wrapper */}
        <div className="bg-white rounded-xl border-2 border-slate-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse min-w-[1600px]">
              <thead>
                <tr className="bg-slate-900">
                  <th className="p-4 text-left text-[11px] font-black text-white uppercase border-r border-slate-800 w-[80px]">User</th>
                  
                  {/* ENGLISH GROUP */}
                  <th className="p-4 text-left text-[11px] font-black text-white uppercase border-r border-slate-800 w-[200px]">Name (EN)</th>
                  <th className="p-4 text-left text-[11px] font-black text-white uppercase border-r border-slate-800 w-[150px]">Title (EN)</th>
                  <th className="p-4 text-left text-[11px] font-black text-white uppercase border-r border-slate-800 w-[400px]">Feedback (EN)</th>

                  {/* ARABIC GROUP */}
                  <th className="p-4 text-right text-[11px] font-black text-white uppercase border-r border-slate-800 w-[200px]">الاسم (AR)</th>
                  <th className="p-4 text-right text-[11px] font-black text-white uppercase border-r border-slate-800 w-[150px]">المسمى (AR)</th>
                  <th className="p-4 text-right text-[11px] font-black text-white uppercase border-r border-slate-800 w-[400px]">الرأي (AR)</th>

                  <th className="p-4 text-center text-[11px] font-black text-white uppercase w-[120px]">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="w-[50px] h-[50px] rounded-full overflow-hidden bg-slate-100 border-2 border-blue-600 flex items-center justify-center shrink-0">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} className="w-full h-full object-cover" alt="User" />
                            ) : (
                                <User size={20} className="text-slate-900" />
                            )}
                        </div>
                      </td>

                      {/* ENGLISH CONTENT */}
                      <td className="p-4 text-sm font-bold text-slate-900 truncate max-w-[200px]">{item.name?.en || 'Untitled'}</td>
                      <td className="p-4 text-sm font-bold text-slate-900">{item.title?.en || 'Customer'}</td>
                      <td className="p-4 text-sm font-medium text-slate-600 truncate max-w-[400px]" title={item.text?.en}>
                        {item.text?.en || 'No content provided'}
                      </td>

                      {/* ARABIC CONTENT */}
                      <td className="p-4 text-sm font-bold text-slate-900 text-right truncate max-w-[200px]" dir="rtl">{item.name?.ar || '---'}</td>
                      <td className="p-4 text-sm font-bold text-slate-900 text-right" dir="rtl">{item.title?.ar || '---'}</td>
                      <td className="p-4 text-sm font-medium text-slate-600 text-right truncate max-w-[400px]" dir="rtl" title={item.text?.ar}>
                        {item.text?.ar || 'لا يوجد نص'}
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Link href={`/dashboard/testimonials/edit/${item._id}`} className="p-2 bg-slate-100 text-slate-900 rounded-md border border-slate-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors">
                            <Edit3 size={18} />
                          </Link>
                          <button onClick={() => handleDelete(item._id)} className="p-2 bg-red-50 text-red-500 rounded-md border border-red-200 hover:bg-red-500 hover:text-white transition-colors cursor-pointer">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-slate-400 font-black uppercase tracking-widest text-sm">No Testimonials Found</span>
                          <p className="text-slate-400 text-xs">Start by adding a new customer review.</p>
                        </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { height: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; border: 2px solid #ffffff; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
      `}</style>
    </div>
  );
}