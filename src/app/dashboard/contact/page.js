"use client";
import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { Facebook,Youtube,TikTok,Instagram,Snapchat,Threads } from '@/utils/constants';
import { Save, MapPin, Phone, Mail, Globe, Trash2, Lock, Linkedin,} from 'lucide-react';
import OverlayLoader from '@/components/loader';

export default function ContactSettings() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [initialData, setInitialData] = useState(null); 
  
  const [formData, setFormData] = useState({
    emails: { supportMail: '', reservationMail: '' },
    phones: { whatsapp1: '', whatsapp2: '', whatsapp3: '' },
    socials: { facebook: '', instagram: '' ,tiktok: '', snapchat: '', linkedin: '', youtube: '', threads: ''},
    locations: []
  });

  useEffect(() => {
    api.get('/app-settings').then(res => {
      if(res.data?.data?.contactSettings) {
        const data = res.data.data.contactSettings;
        const cleanData = {
          emails: data.emails || { supportMail: '', reservationMail: '' },
          phones: data.phones || { whatsapp1: '', whatsapp2: '',whatsapp3: '' },
          socials: data.socials || { facebook: '', instagram: '' ,tiktok: '', snapchat: '', linkedin: '', youtube: '', threads: ''},
          locations: (data.locations || []).map(loc => ({
            name_en: loc.en || '',
            name_ar: loc.ar || '',
            href: loc.href || '',
            hours_en: loc.workingHours?.en || '',
            hours_ar: loc.workingHours?.ar || '',
            contactNumber: loc.contactNumber || ''
          }))
        };
        setFormData(cleanData);
        setInitialData(JSON.stringify(cleanData)); 
      }
      setLoading(false);
    });
  }, []);

  const isButtonDisabled = useMemo(() => {
    const isEmailsMissing = !formData.emails.supportMail.trim();
    const hasInvalidBranches = formData.locations.length === 0 || formData.locations.some(loc => 
      !loc.name_en.trim() || !loc.href.trim() || !loc.hours_en.trim()
    );
    const isPristine = JSON.stringify(formData) === initialData;
    return isEmailsMissing || hasInvalidBranches || isPristine;
  }, [formData, initialData]);

  const addLocation = () => {
    setFormData({
      ...formData,
      locations: [...formData.locations, { name_en: '', name_ar: '', href: '', hours_en: '', hours_ar: '' }]
    });
  };

  const removeLocation = (index) => {
    setFormData({ ...formData, locations: formData.locations.filter((_, i) => i !== index) });
  };

  const handleLocationChange = (index, field, value) => {
    const newLocs = [...formData.locations];
    newLocs[index] = { ...newLocs[index], [field]: value };
    setFormData({ ...formData, locations: newLocs });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isButtonDisabled) return;

    setActionLoading(true);
    const payload = {
        ...formData,
        locations: formData.locations.map(loc => ({ 
            en: loc.name_en, 
            ar: loc.name_ar, 
            href: loc.href,
            workingHours: { en: loc.hours_en, ar: loc.hours_ar } ,
            contactNumber: loc.contactNumber 
        }))
    };

    try {
      await api.put('/app-settings', { contactSettingsData: payload });
      setInitialData(JSON.stringify(formData)); 
      alert("Contact settings updated successfully!");
    } catch (err) {
      alert("Update failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const labelClass = "flex items-center gap-2 text-slate-900 font-black text-[11px] mb-2 uppercase tracking-wider";
  const inputClass = "w-full p-3.5 rounded-lg border-2 border-slate-300 focus:border-blue-600 bg-white text-slate-900 font-bold outline-none mb-5 transition-all";
  const sectionHeaderClass = "text-blue-600 font-black text-[11px] mb-6 border-b-2 border-slate-100 pb-2 uppercase tracking-widest flex items-center justify-between";

  if (loading) return <OverlayLoader message="Loading settings..." />;

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:py-10 md:px-6">
      {actionLoading && <OverlayLoader message="Saving changes..." />}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-2xl border-2 border-slate-300 max-w-[800px] mx-auto shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="font-black text-2xl md:text-4xl text-slate-900 tracking-tighter uppercase">Contact Details</h1>
            <p className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${isButtonDisabled ? 'text-slate-400' : 'text-blue-600 animate-pulse'}`}>
                {isButtonDisabled ? 'Validate all fields to save' : 'Ready to Sync'}
            </p>
          </div>
          <button type="submit" disabled={isButtonDisabled} className={`w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black text-sm transition-all shadow-lg uppercase tracking-widest ${isButtonDisabled ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-600'}`}>
            {isButtonDisabled ? <Lock size={18} /> : <Save size={18} />} Save Changes
          </button>
        </div>

        <div className={sectionHeaderClass}>Communication Channels</div>
        <div className="grid grid-cols-1 gap-x-6">
            <div  className='grid grid-cols-1 md:grid-cols-2 gap-x-6'>
               <div>
               <label className={labelClass}><Mail size={14} /> Support Email</label>
               <input required className={inputClass} value={formData.emails.supportMail} onChange={e => setFormData({...formData, emails: {...formData.emails, supportMail: e.target.value}})} />
               </div>
               <div>
               <label className={labelClass}><Mail size={14} /> Reservation Email</label>
                <input className={inputClass} value={formData.emails.reservationMail} onChange={e => setFormData({...formData, emails: {...formData.emails, reservationMail: e.target.value}})} />
               </div>

               <div>
               <label className={labelClass}><Phone size={14} /> WhatsApp Primary</label>
               <input className={inputClass} value={formData.phones.whatsapp1} onChange={e => setFormData({...formData, phones: {...formData.phones, whatsapp1: e.target.value}})} />
               </div>
               <div>
               <label className={labelClass}><Phone size={14} /> WhatsApp Secondary</label>
               <input className={inputClass} value={formData.phones.whatsapp2} onChange={e => setFormData({...formData, phones: {...formData.phones, whatsapp2: e.target.value}})} />
               </div>

<div>
<label className={labelClass}><Phone size={14} /> WhatsApp Alternate</label>
<input className={inputClass} value={formData.phones.whatsapp3} onChange={e => setFormData({...formData, phones: {...formData.phones, whatsapp3: e.target.value}})} />
</div>

                
            </div>
            
        </div>

        <div className={sectionHeaderClass}>Social Media Links</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div>
                <label className={labelClass}><Facebook size={14} /> Facebook URL</label>
                <input className={inputClass} value={formData.socials.facebook} onChange={e => setFormData({...formData, socials: {...formData.socials, facebook: e.target.value}})} />
            </div>
            <div>
                <label className={labelClass}><Instagram size={14} /> Instagram URL</label>
                <input className={inputClass} value={formData.socials.instagram} onChange={e => setFormData({...formData, socials: {...formData.socials, instagram: e.target.value}})} />
            </div>
            <div>
                <label className={labelClass}><TikTok size={14} /> Tiktok URL</label>
                <input className={inputClass} value={formData.socials.tiktok} onChange={e => setFormData({...formData, socials: {...formData.socials, tiktok: e.target.value}})} />
            </div>
            <div>
              <label className={labelClass}><Snapchat size={14} /> Snapchat URL</label>
              <input className={inputClass} value={formData.socials.snapchat} onChange={e => setFormData({...formData, socials: {...formData.socials, snapchat: e.target.value}})} />
            </div>
            <div>
              <label className={labelClass}><Linkedin size={14} /> LinkedIn URL</label>
              <input className={inputClass} value={formData.socials.linkedin} onChange={e => setFormData({...formData, socials: {...formData.socials, linkedin: e.target.value}})} />
            </div>
            <div>
              <label className={labelClass}><Youtube size={14} /> YouTube URL</label>
              <input className={inputClass} value={formData.socials.youtube} onChange={e => setFormData({...formData, socials: {...formData.socials, youtube: e.target.value}})} />
            </div>
            <div>
              <label className={labelClass}><Threads size={14} /> Threads URL</label>
              <input className={inputClass} value={formData.socials.threads} onChange={e => setFormData({...formData, socials: {...formData.socials, threads: e.target.value}})} />
            </div>
        </div>

        <div className={`${sectionHeaderClass} mt-6`}>
          <span className="flex items-center gap-2">Branch Locations</span>
          <button type="button" onClick={addLocation} className="bg-blue-600 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-black transition-colors">+ ADD BRANCH</button>
        </div>

        <div className="space-y-4">
            {formData.locations.map((loc, index) => (
            <div key={index} className="relative border-2 border-slate-200 p-6 rounded-2xl bg-slate-50">
                <button type="button" onClick={() => removeLocation(index)} className="absolute top-4 right-4 text-red-400"><Trash2 size={18} /></button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Branch Name (EN)</label>
                    <input className={inputClass} value={loc.name_en} onChange={e => handleLocationChange(index, 'name_en', e.target.value)} />
                    <label className={labelClass}>Working Hours (EN)</label>
                    <input className={inputClass} value={loc.hours_en} onChange={e => handleLocationChange(index, 'hours_en', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Branch Name (AR)</label>
                    <input className={inputClass} dir="rtl" value={loc.name_ar} onChange={e => handleLocationChange(index, 'name_ar', e.target.value)} />
                    <label className={labelClass}>Working Hours (AR)</label>
                    <input className={inputClass} dir="rtl" value={loc.hours_ar} onChange={e => handleLocationChange(index, 'hours_ar', e.target.value)} />
                  </div>
                </div>
                <label className={labelClass}><Globe size={14} /> Google Maps URL</label>
                <input className={`${inputClass} mb-0`} value={loc.href} onChange={e => handleLocationChange(index, 'href', e.target.value)} />
                <label className={labelClass}><Phone size={14} /> WhatsApp</label>
                <input className={`${inputClass} mb-0`} value={loc.contactNumber} onChange={e => handleLocationChange(index, 'contactNumber', e.target.value)} />
            </div>
            ))}
        </div>
      </form>
    </div>
  );
}