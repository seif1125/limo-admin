"use client";
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Upload, X, ImageIcon, Video, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import OverlayLoader from '@/components/loader';

export default function AddBannerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [localImage, setLocalImage] = useState(null); 
  
  const [formData, setFormData] = useState({
    bannerType: 'image', // 'image' | 'video'
    title_en: '', title_ar: '',
    subtitle_en: '', subtitle_ar: '',
    buttonText_en: '', buttonText_ar: '',
    buttonUrl: '',
    imageUrl: '', // This will hold either the Cloudinary URL or the typed video URL
  });

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) setLocalImage({ file, preview: URL.createObjectURL(file) });
  };

  // 1. Correct form validation for both types
  const isFormValid = useMemo(() => {
    const baseValid = formData.title_en && formData.title_ar;
    if (formData.bannerType === 'image') {
      return baseValid && localImage;
    } else {
      return baseValid && formData.imageUrl.trim() !== '';
    }
  }, [formData, localImage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    
    try {
      let finalPayload = { ...formData };

      if (formData.bannerType === 'image') {
        setStatusMessage("Uploading asset to Cloudinary...");
        const data = new FormData();
        data.append("file", localImage.file);
        data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
        
        const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: data });
        const fileData = await res.json();
        
        // Save Cloudinary URL to imageUrl
        finalPayload.imageUrl = fileData.secure_url;
      } else {
        setStatusMessage("Saving banner configuration...");
        // 2. Do NOT overwrite finalPayload.imageUrl here. 
        // It already contains the video URL typed by the user.
      }
     
      await api.post('/banners', finalPayload);
      router.push('/dashboard/banners');
    } catch (err) { 
      alert("Failed to create banner"); 
    } finally { 
      setLoading(false); 
      setStatusMessage("");
    }
  };

  const labelClass = "block text-slate-900 font-black text-[11px] mb-2 uppercase tracking-widest";
  const inputClass = "w-full p-4 text-slate-900 rounded-xl border-2 border-slate-100 focus:border-blue-600 outline-none font-bold bg-slate-50 transition-all";

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:py-10">
      {loading && <OverlayLoader message={statusMessage} />}
      <div className="bg-white p-6 md:p-12 rounded-3xl border-2 border-slate-200 max-w-[900px] mx-auto shadow-xl">
        
        <header className="flex justify-between items-center mb-10">
          <div className="flex flex-col gap-2">
            <Link href="/dashboard/banners" className="text-slate-400 hover:text-blue-600 font-black flex items-center gap-1 text-xs uppercase tracking-wider transition-colors">
              <ArrowLeft size={16} /> Back to Banners
            </Link>
            <h1 className="font-black text-2xl md:text-4xl text-slate-900 m-0 tracking-tighter uppercase flex items-center gap-3 mt-2">
              Add New Banner
            </h1>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* BANNER MEDIA TYPE SELECTOR */}
          <div>
            <label className={labelClass}>01. Media Backdrop Type</label>
            <div className="grid grid-cols-2 gap-4 p-2 bg-slate-100 rounded-2xl border-2 border-slate-200/60">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, bannerType: 'image' })}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                  formData.bannerType === 'image' 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                <ImageIcon size={16} /> Static Image
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, bannerType: 'video' })}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                  formData.bannerType === 'video' 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                <Video size={16} /> Stream Video
              </button>
            </div>
          </div>

          {/* DYNAMIC MEDIA SECTION */}
          <div>
            {formData.bannerType === 'image' ? (
              <>
                <div className="flex items-center gap-2 mb-4 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">
                  <ImageIcon size={14}/> 02. Image Upload
                </div>
                {localImage ? (
                  <div className="relative w-full h-[300px] rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner">
                    <img src={localImage.preview} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setLocalImage(null)} className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-105">
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-[250px] border-4 border-dashed border-slate-200 rounded-3xl cursor-pointer bg-slate-50 hover:bg-slate-100/50 hover:border-blue-400 transition-colors">
                    <Upload size={48} className="text-slate-300 mb-2" />
                    <span className="font-black text-xs text-slate-500 uppercase tracking-widest">Select Image Backdrop</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                  </label>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">
                  <Video size={14}/> 02. Video Integration Link
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <LinkIcon size={18} />
                  </div>
                  <input 
                    type="url" 
                    placeholder="e.g. https://www.youtube.com/watch?v=... or direct mp4 file link" 
                    className={`${inputClass} pl-12`} 
                    value={formData.imageUrl} 
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} 
                  />
                </div>
              </>
            )}
          </div>

          {/* METADATA FIELDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Title (EN)</label>
                <input className={inputClass} value={formData.title_en} onChange={e => setFormData({...formData, title_en: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Subtitle (EN)</label>
                <textarea className={`${inputClass} h-[116px] resize-none`} value={formData.subtitle_en} onChange={e => setFormData({...formData, subtitle_en: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Button Text (EN)</label>
                <input className={inputClass} value={formData.buttonText_en} onChange={e => setFormData({...formData, buttonText_en: e.target.value})} />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Title (AR)</label>
                <input className={inputClass} dir="rtl" value={formData.title_ar} onChange={e => setFormData({...formData, title_ar: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Subtitle (AR)</label>
                <textarea className={`${inputClass} h-[116px] resize-none`} dir="rtl" value={formData.subtitle_ar} onChange={e => setFormData({...formData, subtitle_ar: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Button Text (AR)</label>
                <input className={inputClass} dir="rtl" value={formData.buttonText_ar} onChange={e => setFormData({...formData, buttonText_ar: e.target.value})} />
              </div>
            </div>
          </div>

          {/* TARGET LINK URL */}
          <div>
            <label className={labelClass}>Target Action URL</label>
            <input placeholder="e.g. /fleet or https://external-link.com" className={inputClass} value={formData.buttonUrl} onChange={e => setFormData({...formData, buttonUrl: e.target.value})} />
          </div>

          {/* DEPLOY BUTTON */}
          <button 
            type="submit" 
            disabled={!isFormValid || loading} 
            className={`w-full p-6 rounded-2xl font-black uppercase tracking-widest transition-all text-lg shadow-xl
              ${isFormValid ? 'bg-slate-900 text-white hover:bg-blue-600 cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
            `}
          >
            {loading ? "PROCESSING DESIGN..." : "DEPLOY BANNER"}
          </button>
        </form>
      </div>
    </div>
  );
}