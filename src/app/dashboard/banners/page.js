"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api'; 
import { Trash2, Plus, ImageIcon, ExternalLink } from 'lucide-react';
import OverlayLoader from '@/components/loader';

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => { loadBanners(); }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      setStatusMessage("Fetching Data...");
      const res = await api.get('/banners');
      setBanners(res.data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    setLoading(true);
    setStatusMessage("Deleting Image & Data...");
    try {
      await api.delete(`/banners/${id}`);
      setBanners(prev => prev.filter(b => b._id !== id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:p-6 w-full overflow-x-hidden box-border">
      {loading && <OverlayLoader message={statusMessage} />}
      
      <div className="max-w-full mx-auto">
        
        {/* Header Section */}
        <div className="bg-white p-5 md:p-6 rounded-xl border-2 border-slate-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <ImageIcon className="text-slate-900" size={28} /> 
            <h1 className="text-slate-900 font-black text-xl md:text-2xl uppercase tracking-tighter">
                BANNER INVENTORY
            </h1>
          </div>
       
          {banners.length < 2 && (
            <Link 
              href="/dashboard/banners/add" 
              className="w-full md:w-auto text-center bg-slate-900 text-white px-6 py-3 rounded-lg no-underline font-black text-xs uppercase hover:bg-blue-700 transition"
            >
                + NEW BANNER
            </Link>
          )}
        </div>

        {/* Scrollable Table Wrapper */}
        <div className="bg-white rounded-xl border-2 border-slate-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-900">
                  <th className="p-4 text-left text-[11px] font-black text-white uppercase border-r border-slate-800 w-[120px]">Preview</th>
                  <th className="p-4 text-left text-[11px] font-black text-white uppercase border-r border-slate-800 w-[200px]">Title (EN)</th>
                  <th className="p-4 text-left text-[11px] font-black text-white uppercase border-r border-slate-800 w-[200px]">Subtitle (EN)</th>
                  <th className="p-4 text-left text-[11px] font-black text-white uppercase border-r border-slate-800 w-[150px]">Button (EN)</th>
                  <th className="p-4 text-right text-[11px] font-black text-white uppercase border-r border-slate-800 w-[200px]">العنوان (AR)</th>
                  <th className="p-4 text-right text-[11px] font-black text-white uppercase border-r border-slate-800 w-[200px]">الفرعي (AR)</th>
                  <th className="p-4 text-right text-[11px] font-black text-white uppercase border-r border-slate-800 w-[150px]">الزر (AR)</th>
                  <th className="p-4 text-center text-[11px] font-black text-white uppercase w-[100px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {banners.length > 0 ? (
                  banners.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <img src={b.imageUrl} alt="banner" className="w-24 h-14 object-cover rounded-md border border-slate-300" />
                      </td>
                      
                      {/* English Section */}
                      <td className="p-4 text-sm font-bold text-slate-900 truncate max-w-[200px]" title={b.title?.en}>{b.title?.en || '---'}</td>
                      <td className="p-4 text-sm font-bold text-slate-900 truncate max-w-[200px]" title={b.subtitle?.en}>{b.subtitle?.en || '---'}</td>
                      <td className="p-4">
                        {b.button1?.link ? (
                            <a href={b.button1.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200 text-xs font-black">
                                <ExternalLink size={12} /> {b.button1?.text?.en || 'Link'}
                            </a>
                        ) : (
                            <span className="text-slate-400 text-xs font-bold">No Link</span>
                        )}
                      </td>
                      
                      {/* Arabic Section */}
                      <td className="p-4 text-right text-sm font-bold text-slate-900" dir="rtl">{b.title?.ar || '---'}</td>
                      <td className="p-4 text-right text-sm font-bold text-slate-900" dir="rtl">{b.subtitle?.ar || '---'}</td>
                      <td className="p-4 text-right">
                        {b.button1?.link ? (
                            <a href={b.button1.link} target="_blank" rel="noopener noreferrer" className="inline-flex flex-row-reverse items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200 text-xs font-black" dir="rtl">
                                <ExternalLink size={12} /> {b.button1?.text?.ar || 'رابط'}
                            </a>
                        ) : (
                            <span className="text-slate-400 text-xs font-bold">لا يوجد</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleDelete(b._id)} 
                          className="bg-red-100 text-red-600 border border-red-200 p-2 rounded-md hover:bg-red-600 hover:text-white transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-20 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2 uppercase tracking-widest font-black text-sm">
                          No Banners Found
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}