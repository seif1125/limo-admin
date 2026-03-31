"use client";
import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { Tag, Plus, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import OverlayLoader from '@/components/loader';

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  // CHECK: Is the typed name already in our list? (Case-Insensitive)
  const isDuplicate = useMemo(() => {
    return categories.some(cat => cat.name.toLowerCase() === newCategory.trim().toLowerCase());
  }, [newCategory, categories]);

  const canSubmit = newCategory.trim().length > 2 && !isDuplicate && !isSubmitting;

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/categories', { name: newCategory.trim() });
      // Add to local list and clear input
      setCategories([res.data, ...categories]);
      setNewCategory("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add category");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <OverlayLoader message="Syncing Categories..." />;

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:p-10">
      <div className="max-w-2xl mx-auto">
        
        <Link href="/dashboard/fleet" className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase hover:text-blue-600 transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Fleet
        </Link>

        <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl overflow-hidden">
          {/* HEADER & INPUT */}
          <div className="p-8 border-b-2 border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3 mb-6">
              <Tag className="text-slate-900" size={28} />
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Fleet Categories</h1>
            </div>

            <form onSubmit={handleAddCategory} className="relative">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Add New Category Type</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input 
                    type="text"
                    placeholder="e.g. ULTRA LUXURY"
                    className={`w-full p-4 rounded-xl border-2 outline-none font-bold transition-all uppercase ${
                      isDuplicate ? 'border-red-400 bg-red-50 text-red-900' : 'border-slate-200 focus:border-blue-600 bg-white'
                    }`}
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  {isDuplicate && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 flex items-center gap-1 font-black text-[10px] uppercase">
                      <AlertCircle size={14} /> Already Exists
                    </div>
                  )}
                </div>
                <button 
                  type="submit"
                  disabled={!canSubmit}
                  className={`px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all ${
                    canSubmit 
                    ? 'bg-slate-900 text-white hover:bg-blue-600 shadow-lg active:scale-95' 
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                  Add Type
                </button>
              </div>
              <p className="mt-3 text-[9px] font-bold text-slate-400 uppercase leading-relaxed">
                Note: Categories are permanent to protect existing fleet records. Check spelling before adding.
              </p>
            </form>
          </div>

          {/* CATEGORY LIST */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Active Categories ({categories.length})</h3>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <div 
                    key={cat._id} 
                    className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Tag size={16} />
                      </div>
                      <span className="font-black text-slate-900 uppercase tracking-tight">{cat.name}</span>
                    </div>
                    <CheckCircle2 className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" size={18} />
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-300 font-bold uppercase text-xs tracking-widest">
                  No categories defined yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}