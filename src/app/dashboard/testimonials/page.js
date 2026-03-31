"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api'; 
import { Trash2, Edit3, MessageSquare, User, Star, Globe } from 'lucide-react';
import OverlayLoader from '@/components/loader';

export default function TestimonialsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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
    if (!window.confirm("Are you sure?")) return;
    setActionLoading(true);
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
    <div className="bg-slate-100 min-h-screen p-4 md:p-6 w-full">
      {actionLoading && <OverlayLoader message="Removing..." />}

      <div className="max-w-[1200px] mx-auto">
        <div className="bg-white p-6 rounded-xl border-2 border-slate-300 flex flex-col md:flex-row justify-between items-center gap-4 mb-6 shadow-sm">
          <div className="flex items-center gap-3">
            <MessageSquare className="text-slate-900" size={28} />
            <h1 className="font-black text-2xl text-slate-900 tracking-tighter uppercase">Testimonials</h1>
          </div>
          <Link href="/dashboard/testimonials/add" className="bg-slate-900 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all">
            + Add New Review
          </Link>
        </div>

        <div className="bg-white rounded-xl border-2 border-slate-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900">
                  <th className="p-4 text-left text-[11px] font-black text-white uppercase w-[80px]">User</th>
                  <th className="p-4 text-left text-[11px] font-black text-white uppercase">Client Details</th>
                  <th className="p-4 text-left text-[11px] font-black text-white uppercase">Comment</th>
                  <th className="p-4 text-center text-[11px] font-black text-white uppercase w-[120px]">Rating</th>
                  <th className="p-4 text-center text-[11px] font-black text-white uppercase w-[120px]">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-600">
                          <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-black text-slate-900 text-sm m-0">{item.name}</p>
                        <p className="text-blue-600 text-[10px] font-bold uppercase m-0">{item.title}</p>
                        <p className="text-slate-400 text-[9px] font-bold flex items-center gap-1 uppercase mt-1">
                          <Globe size={10} /> {item.origin || 'Global'}
                        </p>
                      </td>
                      <td className="p-4 text-sm text-slate-600 max-w-[300px] italic">
                        "{item.comment.substring(0, 80)}..."
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center text-amber-500">
                          {[...Array(item.rating || 5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Link href={`/dashboard/testimonials/edit/${item._id}`} className="p-2 text-slate-600 hover:text-blue-600 border rounded-md transition-colors"><Edit3 size={18} /></Link>
                          <button onClick={() => handleDelete(item._id)} className="p-2 text-red-400 hover:text-red-600 border rounded-md transition-colors cursor-pointer"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="p-20 text-center text-slate-400 font-bold uppercase">No records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}