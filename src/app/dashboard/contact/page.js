"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Save, MapPin, Phone, Mail, Globe, Trash2, Facebook, Instagram } from 'lucide-react';
import OverlayLoader from '@/components/loader';

export default function ContactSettings() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [resetData, setResetData] = useState(null); 
  const [formData, setFormData] = useState({
    phone: '', email: '', whatsapp: '', facebook: '', instagram: '',
    locations: []
  });

  useEffect(() => {
    api.get('/contact').then(res => {
      if(res.data) {
        setFormData(res.data);
        setResetData(JSON.stringify(res.data)); 
      }
      setLoading(false);
    });
  }, []);

  const isChanged = JSON.stringify(formData) !== resetData;

  const addLocation = () => {
    setFormData({
      ...formData,
      locations: [...formData.locations, { name: { en: '', ar: '' }, address: { en: '', ar: '' }, mapsUrl: '' }]
    });
  };

  const removeLocation = (index) => {
    const newLocs = formData.locations.filter((_, i) => i !== index);
    setFormData({ ...formData, locations: newLocs });
  };

  const handleLocationChange = (index, field, lang, value) => {
    const newLocs = [...formData.locations];
    const updatedLoc = { ...newLocs[index] };
    if (lang) {
        updatedLoc[field] = { ...updatedLoc[field], [lang]: value };
    } else {
        updatedLoc[field] = value;
    }
    newLocs[index] = updatedLoc;
    setFormData({ ...formData, locations: newLocs });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isChanged) return;

    setActionLoading(true);
    try {
      const res = await api.post('/contact', formData);
      setResetData(JSON.stringify(res.data)); 
      alert("Contact settings updated successfully!");
    } catch (err) {
      alert("Failed to update.");
    } finally {
      setActionLoading(false);
    }
  };

  // Reusable Tailwind classes
  const labelClass = "flex items-center gap-2 text-slate-900 font-black text-[11px] mb-2 uppercase tracking-wider";
  const inputClass = "w-full p-3.5 rounded-lg border-2 border-slate-300 focus:border-blue-600 focus:ring-0 bg-white text-slate-900 font-bold outline-none mb-5 transition-all";
  const sectionHeaderClass = "text-blue-600 font-black text-[11px] mb-6 border-b-2 border-slate-100 pb-2 uppercase tracking-widest flex items-center justify-between";

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:py-10 md:px-6">
      {actionLoading && <OverlayLoader message="Saving changes..." />}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-2xl border-2 border-slate-300 max-w-[1100px] mx-auto shadow-xl">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="font-black text-2xl md:text-4xl text-slate-900 m-0 tracking-tighter uppercase">
                Contact & Locations
            </h1>
            {!isChanged ? (
              <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-widest">No changes detected</p>
            ) : (
              <p className="text-blue-600 text-[10px] font-bold mt-1 uppercase tracking-widest animate-pulse">Unsaved changes present</p>
            )}
          </div>
          <button 
            type="submit" 
            disabled={!isChanged} 
            className={`w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black text-sm transition-all shadow-lg uppercase tracking-widest ${
                isChanged ? 'bg-slate-900 text-white hover:bg-blue-600 cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save size={18} /> Save Settings
          </button>
        </div>

        {/* PRIMARY CHANNELS GRID */}
        <div className={sectionHeaderClass}>Primary Channels</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
          <div>
            <label className={labelClass}><Phone size={14} /> Phone Number</label>
            <input className={inputClass} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+20..." />
          </div>
          <div>
            <label className={labelClass}><Mail size={14} /> Business Email</label>
            <input className={inputClass} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="info@company.com" />
          </div>
          <div>
            <label className={labelClass}><Globe size={14} /> WhatsApp Number</label>
            <input className={inputClass} value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="+20..." />
          </div>
          <div>
            <label className={labelClass}><Facebook size={14} /> Facebook URL</label>
            <input className={inputClass} value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} placeholder="facebook.com/..." />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <label className={labelClass}><Instagram size={14} /> Instagram URL</label>
            <input className={inputClass} value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} placeholder="instagram.com/..." />
          </div>
        </div>

        {/* BRANCH LOCATIONS SECTION */}
        <div className={`${sectionHeaderClass} mt-6`}>
          <span>Branch Locations</span>
          <button 
            type="button" 
            onClick={addLocation} 
            className="bg-blue-600 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-black transition-colors"
          >
            + ADD BRANCH
          </button>
        </div>

        <div className="space-y-6">
            {formData.locations.map((loc, index) => (
            <div key={index} className="relative border-2 border-slate-200 p-6 md:p-8 rounded-2xl bg-slate-50 group hover:border-blue-300 transition-colors">
                <button 
                    type="button" 
                    onClick={() => removeLocation(index)} 
                    className="absolute top-4 right-4 text-red-400 hover:text-red-600 p-2 transition-colors"
                >
                    <Trash2 size={20} />
                </button>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-6">
                    {/* EN */}
                    <div>
                        <label className={labelClass}>Branch Name (EN)</label>
                        <input className={inputClass} value={loc.name.en} onChange={e => handleLocationChange(index, 'name', 'en', e.target.value)} />
                        <label className={labelClass}>Full Address (EN)</label>
                        <input className={inputClass} value={loc.address.en} onChange={e => handleLocationChange(index, 'address', 'en', e.target.value)} />
                    </div>
                    {/* AR */}
                    <div dir="rtl">
                        <label className={`${labelClass} text-right`}><span className="hidden lg:inline-block"></span>اسم الفرع (AR)</label>
                        <input className={`${inputClass} text-right`} value={loc.name.ar} onChange={e => handleLocationChange(index, 'name', 'ar', e.target.value)} />
                        <label className={`${labelClass} text-right`}>العنوان بالكامل (AR)</label>
                        <input className={`${inputClass} text-right`} value={loc.address.ar} onChange={e => handleLocationChange(index, 'address', 'ar', e.target.value)} />
                    </div>
                </div>

                <label className={labelClass}><MapPin size={14} /> Google Maps URL</label>
                <input 
                    className={`${inputClass} mb-0`} 
                    placeholder="https://goo.gl/maps/..." 
                    value={loc.mapsUrl} 
                    onChange={e => handleLocationChange(index, 'mapsUrl', null, e.target.value)} 
                />
            </div>
            ))}

            {formData.locations.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                    <MapPin className="mx-auto text-slate-300 mb-2" size={32} />
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No branch locations added</p>
                </div>
            )}
        </div>
      </form>
    </div>
  );
}