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
    title: '',
    subtitle: '',
    buttonText: '',
    buttonUrl: '',
  });

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (localImage) URL.revokeObjectURL(localImage.preview);
    setLocalImage({ file, preview: URL.createObjectURL(file) });
  };

  const isFormValid = useMemo(() => {
    const hasBase = formData.title.trim() && formData.subtitle.trim() && localImage;
    const needsUrl = formData.buttonText.trim() !== "";
    const hasUrl = needsUrl ? formData.buttonUrl.trim() !== "" : true;
    return hasBase && hasUrl;
  }, [formData, localImage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    try {
      setStatusMessage("Uploading visual assets...");
      const data = new FormData();
      data.append("file", localImage.file);
      data.append("upload_preset", uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: data
      });
      const fileData = await res.json();
      
      if (!fileData.secure_url) throw new Error("Upload failed");

      setStatusMessage("Syncing with database...");
      await api.post('/banners', { 
        ...formData, 
        imageUrl: fileData.secure_url 
      });

      router.push('/dashboard/banners');
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Failed to create banner"));
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "block text-slate-900 font-black text-[11px] mb-2 uppercase tracking-widest";
  const inputClass = "w-full p-4 rounded-xl border-2 border-slate-100 focus:border-blue-600 outline-none transition-all text-slate-900 font-bold bg-slate-50 placeholder:text-slate-300";

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:py-10">
      {loading && <OverlayLoader message={statusMessage} />}
      
      <div className="bg-white p-6 md:p-12 rounded-3xl border-2 border-slate-200 max-w-[900px] mx-auto shadow-xl">
        <Link href="/dashboard/banners" className="text-slate-400 font-black flex items-center gap-1 mb-8 text-[10px] hover:text-blue-600 transition-colors uppercase tracking-widest">
          <ArrowLeft size={14} /> Back to Inventory
        </Link>

        <div className="mb-10">
          <h1 className="font-black text-4xl text-slate-900 tracking-tighter uppercase">New Hero Banner</h1>
          <p className="text-slate-400 font-bold text-sm">Design the first thing your customers see.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* IMAGE UPLOAD */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">
              <ImageIcon size={14}/> 01. Visual Backdrop
            </div>
            {localImage ? (
              <div className="relative w-full h-[300px] rounded-2xl overflow-hidden border-4 border-blue-600 shadow-2xl">
                <img src={localImage.preview} className="w-full h-full object-cover" alt="Preview" />
                <button 
                  type="button" 
                  onClick={() => setLocalImage(null)}
                  className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full hover:scale-110 transition shadow-lg"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-[250px] border-4 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group">
                <Upload size={48} className="text-slate-200 group-hover:text-blue-500 mb-4 transition-colors" />
                <span className="font-black text-slate-900 uppercase text-sm tracking-tight">Upload High-Res Image</span>
                <span className="text-slate-400 text-[10px] font-bold mt-2 uppercase">1920 x 800 (Recommended)</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
              </label>
            )}
          </div>

          {/* TEXT CONTENT */}
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">
              <Type size={14}/> 02. Messaging
            </div>
            
            <div>
              <label className={labelClass}>Main Heading</label>
              <input 
                className={inputClass} 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                placeholder="e.g. LUXURY CHAUFFEUR SERVICES" 
              />
            </div>

            <div>
              <label className={labelClass}>Sub-heading / Description</label>
              <textarea 
                className={`${inputClass} h-28 resize-none`} 
                value={formData.subtitle} 
                onChange={e => setFormData({...formData, subtitle: e.target.value})} 
                placeholder="Briefly describe the premium experience..." 
              />
            </div>
          </div>

          {/* CALL TO ACTION */}
          <div className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-100">
            <div className="flex items-center gap-2 mb-6 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">
              <LinkIcon size={14}/> 03. Call to Action
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Button Label</label>
                <input 
                  className="w-full p-4 rounded-xl border-2 border-white focus:border-blue-600 outline-none font-bold text-slate-900 bg-white" 
                  value={formData.buttonText} 
                  onChange={e => setFormData({...formData, buttonText: e.target.value})} 
                  placeholder="e.g. DISCOVER FLEET" 
                />
              </div>
              <div>
                <label className={labelClass}>Target URL</label>
                <input 
                  className="w-full p-4 rounded-xl border-2 border-white focus:border-blue-600 outline-none font-mono text-sm text-blue-600 bg-white" 
                  value={formData.buttonUrl} 
                  onChange={e => setFormData({...formData, buttonUrl: e.target.value})} 
                  placeholder="/fleet or https://wa.me/..." 
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!isFormValid || loading}
            className={`w-full p-6 rounded-2xl font-black text-xl tracking-[0.3em] transition-all flex items-center justify-center gap-4 uppercase shadow-2xl
              ${isFormValid && !loading 
                ? 'bg-slate-900 text-white hover:bg-blue-600 hover:-translate-y-1' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}
            `}
          >
            {loading ? "PROCESSSING..." : "DEPLOY BANNER"}
            {!loading && isFormValid && <CheckCircle size={24} />}
          </button>
        </form>
      </div>
    </div>
  );
}