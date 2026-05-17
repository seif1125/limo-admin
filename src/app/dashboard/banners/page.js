"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api'; 
import { Trash2, ImageIcon, ExternalLink, PlusCircle } from 'lucide-react';
import OverlayLoader from '@/components/loader';

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => { loadBanners(); }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      setStatusMessage("Fetching Banners...");
      const res = await api.get('/banners');
      setBanners(res.data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This will delete the banner and the image.")) return;
    setLoading(true);
    setStatusMessage("Removing Banner...");
    try {
      await api.delete(`/banners/${id}`);
      setBanners(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      alert("Delete failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:p-6 w-full">
      {loading && <OverlayLoader message={statusMessage} />}
      
      <div className="max-w-full mx-auto">
        <div className="bg-white p-6 rounded-xl border-2 border-slate-300 flex flex-col md:flex-row justify-between items-center gap-4 mb-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg">
              <ImageIcon className="text-white" size={24} /> 
            </div>
            <div>
              <h1 className="text-slate-900 font-black text-2xl uppercase tracking-tighter">Hero Banners</h1>
              <p className="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Active: {banners.length} </p>
            </div>
          </div>
          
            <Link href="/dashboard/banners/add" className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-black text-xs uppercase hover:bg-slate-900 transition-all shadow-lg">
              <PlusCircle size={16} /> New Banner
            </Link>
          
        </div>

        <div className="bg-white rounded-xl border-2 border-slate-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[11px] font-black tracking-widest">
                  <th className="p-4 text-left w-[150px]">Preview</th>
                  <th className="p-4 text-left">Content (EN/AR)</th>
                  <th className="p-4 text-left">Action Link</th>
                  <th className="p-4 text-center w-[100px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {banners.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4"><img src={b.imageUrl} className="w-24 h-14 object-cover rounded border border-slate-200 shadow-sm" alt="banner" /></td>
                    <td className="p-4">
                      <div className="font-black text-slate-900 text-sm uppercase">{b.title_en} / {b.title_ar}</div>
                      <div className="text-xs text-slate-500 font-medium truncate max-w-sm">{b.subtitle_en}/{b.subtitle_ar}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-black text-blue-600 uppercase block">{b.buttonText_en}/{b.buttonText_ar}</span>
                      <span className="text-[9px] font-mono text-slate-400 truncate w-40 block">{b.buttonUrl}</span>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleDelete(b._id)} className="p-2.5 bg-red-50 text-red-500 rounded-lg border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}