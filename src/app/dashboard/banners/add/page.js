"use client";
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Upload, X, CheckCircle, Type, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import OverlayLoader from '@/components/loader';

export default function AddBannerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [localImage, setLocalImage] = useState(null); 
  const [formData, setFormData] = useState({
    title_en: '', title_ar: '',
    subtitle_en: '', subtitle_ar: '',
    buttonText_en: '', buttonText_ar: '',
    buttonUrl: '',
  });

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) setLocalImage({ file, preview: URL.createObjectURL(file) });
  };

  const isFormValid = useMemo(() => {
    return formData.title_en && formData.title_ar && localImage;
  }, [formData, localImage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    try {
      const data = new FormData();
      data.append("file", localImage.file);
      data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: data });
      const fileData = await res.json();
      await api.post('/banners', { ...formData, imageUrl: fileData.secure_url });
      router.push('/dashboard/banners');
    } catch (err) { alert("Failed to create banner"); } 
    finally { setLoading(false); }
  };

  const labelClass = "block text-slate-900 font-black text-[11px] mb-2 uppercase tracking-widest";
  const inputClass = "w-full p-4  text-slate-900 rounded-xl border-2 border-slate-100 focus:border-blue-600 outline-none font-bold bg-slate-50";

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:py-10">
      {loading && <OverlayLoader message={statusMessage} />}
      <div className="bg-white p-6 md:p-12 rounded-3xl border-2 border-slate-200 max-w-[900px] mx-auto shadow-xl">
      <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="font-black text-2xl md:text-4xl text-slate-900 m-0 tracking-tighter uppercase flex items-center gap-3">
            <ImageIcon className='text-slate-900 transition-colors hidden md:block' size={48} />
            Add New Banner
            </h1>
          </div>
        
        </header>
        <form onSubmit={handleSubmit} className="space-y-10">
          <div>
            <div className="flex items-center gap-2 mb-4 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]"><ImageIcon size={14}/> 01. Visual Backdrop</div>
            {localImage ? (
              <div className="relative w-full h-[300px] rounded-2xl overflow-hidden"><img src={localImage.preview} className="w-full h-full object-cover" /><button type="button" onClick={() => setLocalImage(null)} className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full"><X size={20} /></button></div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-[250px] border-4 border-dashed border-slate-200 rounded-3xl cursor-pointer"><Upload size={48} className="text-slate-200" /><input type="file" className="hidden" onChange={handleImageSelect} /></label>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className={labelClass}>Title (EN)</label><input className={inputClass} value={formData.title_en} onChange={e => setFormData({...formData, title_en: e.target.value})} />
              <label className={labelClass}>Subtitle (EN)</label><textarea className={inputClass} value={formData.subtitle_en} onChange={e => setFormData({...formData, subtitle_en: e.target.value})} />
              <label className={labelClass}>Button Text (EN)</label><input className={inputClass} value={formData.buttonText_en} onChange={e => setFormData({...formData, buttonText_en: e.target.value})} />
            </div>
            <div className="space-y-4">
              <label className={labelClass}>Title (AR)</label><input className={inputClass} dir="rtl" value={formData.title_ar} onChange={e => setFormData({...formData, title_ar: e.target.value})} />
              <label className={labelClass}>Subtitle (AR)</label><textarea className={inputClass} dir="rtl" value={formData.subtitle_ar} onChange={e => setFormData({...formData, subtitle_ar: e.target.value})} />
              <label className={labelClass}>Button Text (AR)</label><input className={inputClass} dir="rtl" value={formData.buttonText_ar} onChange={e => setFormData({...formData, buttonText_ar: e.target.value})} />
            </div>
          </div>

          <div><label className={labelClass}>Target URL</label><input className={inputClass} value={formData.buttonUrl} onChange={e => setFormData({...formData, buttonUrl: e.target.value})} /></div>

          <button type="submit" disabled={!isFormValid || loading} className="w-full p-6 rounded-2xl font-black bg-slate-900 text-white uppercase shadow-2xl hover:bg-blue-600">
            {loading ? "PROCESSING..." : "DEPLOY BANNER"}
          </button>
        </form>
      </div>
    </div>
  );
}