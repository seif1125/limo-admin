"use client";
import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api'; 
import { Globe, Search, Layout, Save, ShieldCheck, Lock, Languages } from 'lucide-react';
import OverlayLoader from '@/components/loader';

export default function AppSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("Loading Localized Config...");
  const [initialData, setInitialData] = useState(null);
  
  const [formData, setFormData] = useState({
    metadata: {
      domainUrl: '', ogImage: '',
      defaultTitle_en: '', defaultTitle_ar: '',
      titleTemplate_en: '', titleTemplate_ar: '',
      description_en: '', description_ar: '',
      keywords_en: '', keywords_ar: ''
    },
    schemaData: {
      businessType: 'TravelAgency',
      businessName_en: '', businessName_ar: '',
      areaServed_en: '', areaServed_ar: '',
      servicesOffered_en: '', servicesOffered_ar: ''
    }
  });

  const updateMeta = (field, value) => {
    setFormData(prev => ({ ...prev, metadata: { ...prev.metadata, [field]: value } }));
  };

  const updateSchema = (field, value) => {
    setFormData(prev => ({ ...prev, schemaData: { ...prev.schemaData, [field]: value } }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/app-settings');
        if (res.data.data?.appSettings) {
          const app = res.data.data.appSettings;
          const formatted = {
            metadata: { 
              ...app.metadata, 
              keywords_en: app.metadata.keywords_en?.join(', ') || '',
              keywords_ar: app.metadata.keywords_ar?.join(', ') || ''
            },
            schemaData: { 
              ...app.schemaData, 
              areaServed_en: app.schemaData.areaServed_en?.join(', ') || '',
              areaServed_ar: app.schemaData.areaServed_ar?.join(', ') || '',
              servicesOffered_en: app.schemaData.servicesOffered_en?.join(', ') || '',
              servicesOffered_ar: app.schemaData.servicesOffered_ar?.join(', ') || ''
            }
          };
          setFormData(formatted);
          setInitialData(formatted);
        }
      } catch (err) {
        console.error("Failed to load App Settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isButtonDisabled = useMemo(() => {
    const m = formData.metadata;
    const s = formData.schemaData;
    
    const isMissingFields = 
      !m.domainUrl.trim() || !m.ogImage.trim() ||
      !m.defaultTitle_en.trim() || !m.defaultTitle_ar.trim() ||
      !m.titleTemplate_en.trim() || !m.titleTemplate_ar.trim() ||
      !m.description_en.trim() || !m.description_ar.trim() ||
      !m.keywords_en.trim() || !m.keywords_ar.trim() ||
      !s.businessName_en.trim() || !s.businessName_ar.trim() ||
      !s.areaServed_en.trim() || !s.areaServed_ar.trim() ||
      !s.servicesOffered_en.trim() || !s.servicesOffered_ar.trim();

    const isPristine = JSON.stringify(formData) === JSON.stringify(initialData);

    return isMissingFields || isPristine;
  }, [formData, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isButtonDisabled) return;
  
    setLoading(true);
    setStatusMsg("Syncing Localized Meta Tags...");
  
    // Helper to safely format comma-separated strings into trimmed arrays
    const formatArray = (str) => 
      (str || "").split(',').map(item => item.trim()).filter(Boolean);
  
    const payload = {
      appSettingsData: {
        metadata: {
          ...formData.metadata,
          keywords_en: formatArray(formData.metadata.keywords_en),
          keywords_ar: formatArray(formData.metadata.keywords_ar),
        },
        schemaData: {
          ...formData.schemaData,
          areaServed_en: formatArray(formData.schemaData.areaServed_en),
          areaServed_ar: formatArray(formData.schemaData.areaServed_ar),
          servicesOffered_en: formatArray(formData.schemaData.servicesOffered_en),
          servicesOffered_ar: formatArray(formData.schemaData.servicesOffered_ar),
        },
      },
    };
  
    try {
      const res = await api.put('/app-settings', payload);
      setInitialData(formData); // Sync snapshot
      alert("Localized SEO & App Settings Updated Successfully!");
    }finally {
      alert("Localized SEO & App Settings Updated Successfully!");
      setLoading(false);
    }
  };
  const sectionHeader = "text-blue-600 font-black text-[11px] mb-6 border-b-2 border-slate-100 pb-2 uppercase tracking-widest flex items-center gap-2";
  const labelClass = "block text-slate-900 font-black text-[11px] mb-2 uppercase tracking-wider flex items-center gap-1";
  const inputClass = "w-full p-4 rounded-lg border-2 border-slate-300 focus:border-blue-600 bg-white text-slate-900 font-bold outline-none mb-6 transition-all placeholder:text-slate-300";

  if (loading && !initialData) return <OverlayLoader message={statusMsg} />;

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:p-10">
      {loading && <OverlayLoader message={statusMsg} />}
      
      <div className="bg-white p-6 md:p-10 rounded-2xl border-2 border-slate-300 max-w-[1200px] mx-auto shadow-xl">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="font-black text-2xl md:text-4xl text-slate-900 m-0 tracking-tighter uppercase flex items-center gap-3">
            <Globe className='text-slate-900 transition-colors hidden md:block' size={48} />
            App Settings
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">
              {isButtonDisabled && JSON.stringify(formData) === JSON.stringify(initialData) 
                ? "Configuration is up to date" 
                : "All fields are mandatory for SEO health"}
            </p>
          </div>
        
        </header>

        <form onSubmit={handleSubmit}>
          
          {/* GLOBAL SETTINGS */}
          <div className="mb-8">
             <div className={sectionHeader}><Globe size={14}/> Global Settings</div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <div>
                  <label className={labelClass}>Site Domain URL</label>
                  <input required className={inputClass} value={formData.metadata.domainUrl} onChange={e => updateMeta('domainUrl', e.target.value)} placeholder="https://viplimoegypt.com" />
                </div>
                <div>
                  <label className={labelClass}>Social Image (OG URL)</label>
                  <input required className={inputClass} value={formData.metadata.ogImage} onChange={e => updateMeta('ogImage', e.target.value)} placeholder="/images/og-default.jpg" />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">
            
            {/* COLUMN 1: METADATA */}
            <div>
              <div className={sectionHeader}><Search size={14}/> Primary SEO Metadata</div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Default Title (EN)</label>
                  <input required className={inputClass} value={formData.metadata.defaultTitle_en} onChange={e => updateMeta('defaultTitle_en', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Default Title (AR)</label>
                  <input required className={inputClass} value={formData.metadata.defaultTitle_ar} onChange={e => updateMeta('defaultTitle_ar', e.target.value)} dir="rtl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Title Template (EN)</label>
                  <input required className={inputClass} value={formData.metadata.titleTemplate_en} onChange={e => updateMeta('titleTemplate_en', e.target.value)} placeholder="%s | VIP Limousine" />
                </div>
                <div>
                  <label className={labelClass}>Title Template (AR)</label>
                  <input required className={inputClass} value={formData.metadata.titleTemplate_ar} onChange={e => updateMeta('titleTemplate_ar', e.target.value)} placeholder="%s | في آي بي ليموزين" dir="rtl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Keywords (EN)</label>
                  <textarea required className={`${inputClass} h-24 resize-none`} value={formData.metadata.keywords_en} onChange={e => updateMeta('keywords_en', e.target.value)} placeholder="Limousine, Cairo..." />
                </div>
                <div>
                  <label className={labelClass}>Keywords (AR)</label>
                  <textarea required className={`${inputClass} h-24 resize-none`} value={formData.metadata.keywords_ar} onChange={e => updateMeta('keywords_ar', e.target.value)} placeholder="ليموزين, القاهرة..." dir="rtl" />
                </div>
              </div>
            </div>

            {/* COLUMN 2: SCHEMA */}
            <div>
              <div className={sectionHeader}><Layout size={14}/> Site Identity & Schema</div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Business Name (EN)</label>
                  <input required className={inputClass} value={formData.schemaData.businessName_en} onChange={e => updateSchema('businessName_en', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Business Name (AR)</label>
                  <input required className={inputClass} value={formData.schemaData.businessName_ar} onChange={e => updateSchema('businessName_ar', e.target.value)} dir="rtl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Areas Served (EN)</label>
                  <input required className={inputClass} value={formData.schemaData.areaServed_en} onChange={e => updateSchema('areaServed_en', e.target.value)} placeholder="Cairo, Giza..." />
                </div>
                <div>
                  <label className={labelClass}>Areas Served (AR)</label>
                  <input required className={inputClass} value={formData.schemaData.areaServed_ar} onChange={e => updateSchema('areaServed_ar', e.target.value)} placeholder="القاهرة, الجيزة..." dir="rtl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Main Services (EN)</label>
                  <textarea required className={`${inputClass} h-24 resize-none`} value={formData.schemaData.servicesOffered_en} onChange={e => updateSchema('servicesOffered_en', e.target.value)} placeholder="Airport Meet & Greet..." />
                </div>
                <div>
                  <label className={labelClass}>Main Services (AR)</label>
                  <textarea required className={`${inputClass} h-24 resize-none`} value={formData.schemaData.servicesOffered_ar} onChange={e => updateSchema('servicesOffered_ar', e.target.value)} placeholder="استقبال وتوديع بالمطار..." dir="rtl" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className={sectionHeader}><ShieldCheck size={14}/> Site Description</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Meta Description (EN)</label>
                  <textarea required className={`${inputClass} h-32 resize-none`} value={formData.metadata.description_en} onChange={e => updateMeta('description_en', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Meta Description (AR)</label>
                  <textarea required className={`${inputClass} h-32 resize-none`} value={formData.metadata.description_ar} onChange={e => updateMeta('description_ar', e.target.value)} dir="rtl" />
                </div>
            </div>
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