"use client";
import { useState, useEffect, useMemo } from 'react'; // Added useMemo
import api from '@/lib/api'; 
import { Globe, Search, Layout, Save, ShieldCheck, Lock } from 'lucide-react'; // Added Lock icon
import OverlayLoader from '@/components/loader';

export default function AppSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("Loading SEO Config...");
  const [initialData, setInitialData] = useState(null); // Snapshot of database state
  
  const [formData, setFormData] = useState({
    metadata: {
      domainUrl: '', defaultTitle: '', titleTemplate: '',
      description: '', keywords: '', ogImage: ''
    },
    schemaData: {
      businessName: '', businessType: 'TravelAgency',
      areaServed: '', servicesOffered: ''
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/app-settings');
        if (res.data.data?.appSettings) {
          const app = res.data.data.appSettings;
          const formatted = {
            metadata: { 
              ...app.metadata, 
              keywords: app.metadata.keywords?.join(', ') || '' 
            },
            schemaData: { 
              ...app.schemaData, 
              areaServed: app.schemaData.areaServed?.join(', ') || '',
              servicesOffered: app.schemaData.servicesOffered?.join(', ') || ''
            }
          };
          setFormData(formatted);
          setInitialData(formatted); // Save the snapshot
        }
      } catch (err) {
        console.error("Failed to load App Settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute button state
  const isButtonDisabled = useMemo(() => {
    // 1. Check for missing/empty fields
    const isMissingFields = 
      !formData.metadata.domainUrl.trim() ||
      !formData.metadata.defaultTitle.trim() ||
      !formData.metadata.titleTemplate.trim() ||
      !formData.metadata.description.trim() ||
      !formData.metadata.keywords.trim() ||
      !formData.metadata.ogImage.trim() ||
      !formData.schemaData.businessName.trim() ||
      !formData.schemaData.areaServed.trim() ||
      !formData.schemaData.servicesOffered.trim();

    // 2. Check if data is identical to what's in the DB
    const isPristine = JSON.stringify(formData) === JSON.stringify(initialData);

    return isMissingFields || isPristine;
  }, [formData, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isButtonDisabled) return;

    setLoading(true);
    setStatusMsg("Syncing Meta Tags...");

    const payload = {
      appSettingsData: {
        metadata: { 
          ...formData.metadata, 
          keywords: formData.metadata.keywords.split(',').map(k => k.trim()).filter(k => k !== "") 
        },
        schemaData: {
          ...formData.schemaData,
          areaServed: formData.schemaData.areaServed.split(',').map(a => a.trim()).filter(a => a !== ""),
          servicesOffered: formData.schemaData.servicesOffered.split(',').map(s => s.trim()).filter(s => s !== "")
        }
      }
    };

    try {
      await api.put('/app-settings', payload);
      setInitialData(formData); // Update snapshot so button disables again
      alert("SEO & App Settings Updated Successfully!");
    } catch (err) {
      alert("Update failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // UI helpers
  const sectionHeader = "text-blue-600 font-black text-[11px] mb-6 border-b-2 border-slate-100 pb-2 uppercase tracking-widest flex items-center gap-2";
  const labelClass = "block text-slate-900 font-black text-[11px] mb-2 uppercase tracking-wider flex items-center gap-1";
  const inputClass = "w-full p-4 rounded-lg border-2 border-slate-300 focus:border-blue-600 bg-white text-slate-900 font-bold outline-none mb-6 transition-all placeholder:text-slate-300";

  if (loading && !initialData) return <OverlayLoader message={statusMsg} />;

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:p-10">
      {loading && <OverlayLoader message={statusMsg} />}
      
      <div className="bg-white p-6 md:p-10 rounded-2xl border-2 border-slate-300 max-w-[1000px] mx-auto shadow-xl">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="font-black text-2xl md:text-4xl text-slate-900 m-0 tracking-tighter uppercase">App Settings</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
              {isButtonDisabled && JSON.stringify(formData) === JSON.stringify(initialData) 
                ? "Configuration is up to date" 
                : "All fields are mandatory for SEO health"}
            </p>
          </div>
          <Globe className={`${isButtonDisabled ? 'text-slate-200' : 'text-blue-600'} transition-colors hidden md:block`} size={48} />
        </header>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            {/* COLUMN 1 */}
            <div>
              <div className={sectionHeader}><Search size={14}/> Primary SEO Metadata</div>
              
              <label className={labelClass}>Site Domain URL</label>
              <input required className={inputClass} value={formData.metadata.domainUrl} onChange={e => setFormData({...formData, metadata: {...formData.metadata, domainUrl: e.target.value}})} placeholder="https://viplimoegypt.com" />

              <label className={labelClass}>Default Title</label>
              <input required className={inputClass} placeholder="VIP Limousine Egypt" value={formData.metadata.defaultTitle} onChange={e => setFormData({...formData, metadata: {...formData.metadata, defaultTitle: e.target.value}})} />

              <label className={labelClass}>Title Template</label>
              <input required className={inputClass} placeholder="%s | VIP Limousine Egypt" value={formData.metadata.titleTemplate} onChange={e => setFormData({...formData, metadata: {...formData.metadata, titleTemplate: e.target.value}})} />

              <label className={labelClass}>Keywords</label>
              <textarea required className={`${inputClass} h-24 resize-none`} value={formData.metadata.keywords} onChange={e => setFormData({...formData, metadata: {...formData.metadata, keywords: e.target.value}})} placeholder="Limousine, Cairo..." />
            </div>

            {/* COLUMN 2 */}
            <div>
              <div className={sectionHeader}><Layout size={14}/> Site Identity & Schema</div>
              
              <label className={labelClass}>Business Name</label>
              <input required className={inputClass} value={formData.schemaData.businessName} onChange={e => setFormData({...formData, schemaData: {...formData.schemaData, businessName: e.target.value}})} />

              <label className={labelClass}>Social Image (OG)</label>
              <input required className={inputClass} value={formData.metadata.ogImage} onChange={e => setFormData({...formData, metadata: {...formData.metadata, ogImage: e.target.value}})} />

              <label className={labelClass}>Areas Served</label>
              <input required className={inputClass} value={formData.schemaData.areaServed} onChange={e => setFormData({...formData, schemaData: {...formData.schemaData, areaServed: e.target.value}})} placeholder="Cairo, Giza..." />

              <label className={labelClass}>Main Services</label>
              <textarea required className={`${inputClass} h-24 resize-none`} value={formData.schemaData.servicesOffered} onChange={e => setFormData({...formData, schemaData: {...formData.schemaData, servicesOffered: e.target.value}})} placeholder="Airport Meet & Greet..." />
            </div>
          </div>

          <div className="mt-4">
            <div className={sectionHeader}><ShieldCheck size={14}/> Site Description</div>
            <label className={labelClass}>Meta Description</label>
            <textarea required className={`${inputClass} h-32 resize-none`} value={formData.metadata.description} onChange={e => setFormData({...formData, metadata: {...formData.metadata, description: e.target.value}})} />
          </div>

          <button 
            type="submit" 
            disabled={isButtonDisabled}
            className={`w-full p-5 rounded-xl font-black text-lg tracking-widest mt-6 transition-all shadow-lg uppercase flex items-center justify-center gap-3 
              ${isButtonDisabled 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200' 
                : 'bg-slate-900 hover:bg-blue-600 text-white active:scale-[0.98]'}`}
          >
            {isButtonDisabled ? <Lock size={20} /> : <Save size={20} />}
            {isButtonDisabled ? "No Changes Detected" : "Save Global Configuration"}
          </button>
        </form>
      </div>
    </div>
  );
}