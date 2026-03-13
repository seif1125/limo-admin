"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Upload, Save, CheckCircle, Loader2, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export default function AddBannerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [formData, setFormData] = useState({
    title: { en: '', ar: '' },
    subtitle: { en: '', ar: '' },
    imageUrl: '',
    button1: { text: { en: '', ar: '' }, link: '' }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadStatus('uploading');
    
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset); 

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: data }
      );
      const fileData = await res.json();
      if (res.ok && fileData.secure_url) {
        setFormData((prev) => ({ ...prev, imageUrl: fileData.secure_url }));
        setUploadStatus('success');
      } else {
        setUploadStatus('error');
      }
    } catch (err) {
      setUploadStatus('error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
      await api.post(`${apiUrl}/banners`, formData); 
      router.push('/dashboard/banners');
    } catch (err) {
      alert("Connection failed. Check your Backend Terminal.");
    } finally {
      setLoading(false);
    }
  };

  // Reusable Tailwind classes to replace the css object
  const inputClass = "w-full p-3 rounded-lg border-2 border-slate-300 focus:border-blue-500 outline-none transition text-black font-medium mb-4";
  const labelClass = "block text-black font-black text-[11px] mb-2 uppercase tracking-wider";

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:py-10 md:px-6">
      <div className="bg-white p-6 md:p-10 rounded-2xl border-2 border-slate-300 max-w-5xl mx-auto shadow-xl">
        
        <Link href="/dashboard/banners" className="text-blue-600 font-bold flex items-center gap-2 mb-6 no-underline hover:translate-x-[-4px] transition-transform">
          <ArrowLeft size={18} /> BACK TO LIST
        </Link>

        <h1 className="text-black text-2xl md:text-4xl font-black mb-8  pl-4">
            ADD NEW BANNER
        </h1>

        <form onSubmit={handleSubmit}>
          {/* UPLOAD SECTION */}
          <label className="border-4 border-dashed border-blue-600 rounded-2xl p-6 md:p-10 text-center bg-blue-50 cursor-pointer block mb-8 hover:bg-blue-100 transition">
            <input type="file" onChange={handleImageUpload} className="hidden" />
            
            {uploadStatus === 'uploading' && (
              <div className="text-slate-900">
                <Loader2 className="animate-spin mx-auto mb-3" size={40} />
                <p className="font-black uppercase text-sm">Uploading to Cloudinary...</p>
              </div>
            )}
            
            {uploadStatus === 'success' && (
              <div className="text-emerald-600">
                <CheckCircle className="mx-auto mb-3" size={40} />
                <p className="font-black uppercase text-sm mb-4">Image Uploaded Successfully</p>
                <img src={formData.imageUrl} className="h-32 md:h-40 mx-auto rounded-lg border-4 border-emerald-500 shadow-lg object-cover" alt="preview" />
              </div>
            )}
            
            {uploadStatus === 'idle' && (
              <div className="text-slate-900">
                <Upload size={40} className="mx-auto mb-3" />
                <p className="text-black font-black uppercase text-sm">Click to Upload Banner Image</p>
              </div>
            )}
            
            {uploadStatus === 'error' && (
              <div className="text-red-600">
                <Upload size={40} className="mx-auto mb-3" />
                <p className="font-black uppercase text-sm">Upload Failed. Try Again.</p>
              </div>
            )}
          </label>

          {/* DUAL LANGUAGE CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-8">
            
            {/* ENGLISH COLUMN */}
            <div className="space-y-1">
              <p className="text-slate-900 font-black text-xs mb-4 border-b-2 border-slate-200 pb-2 uppercase tracking-widest">English Content</p>
              
              <label className={labelClass}>Main Title</label>
              <input className={inputClass} required value={formData.title.en} onChange={(e) => setFormData({...formData, title: {...formData.title, en: e.target.value}})} />
              
              <label className={labelClass}>Subtitle</label>
              <input className={inputClass} value={formData.subtitle.en} onChange={(e) => setFormData({...formData, subtitle: {...formData.subtitle, en: e.target.value}})} />
              
              <label className={labelClass}>Button Text</label>
              <input className={inputClass} placeholder="e.g. Shop Now" value={formData.button1.text.en} onChange={(e) => setFormData({...formData, button1: {...formData.button1, text: {...formData.button1.text, en: e.target.value}}})} />
            </div>

            {/* ARABIC COLUMN */}
            <div dir="rtl" className="space-y-1">
              <p className="text-slate-900 font-black text-xs mb-4 border-b-2 border-slate-200 pb-2 uppercase tracking-widest text-right">المحتوى العربي</p>
              
              <label className={`${labelClass} text-right`}>العنوان الرئيسي</label>
              <input className={`${inputClass} text-right`} required value={formData.title.ar} onChange={(e) => setFormData({...formData, title: {...formData.title, ar: e.target.value}})} />
              
              <label className={`${labelClass} text-right`}>العنوان الفرعي</label>
              <input className={`${inputClass} text-right`} value={formData.subtitle.ar} onChange={(e) => setFormData({...formData, subtitle: {...formData.subtitle, ar: e.target.value}})} />
              
              <label className={`${labelClass} text-right`}>نص الزر</label>
              <input className={`${inputClass} text-right`} placeholder="مثلاً: تسوق الآن" value={formData.button1.text.ar} onChange={(e) => setFormData({...formData, button1: {...formData.button1, text: {...formData.button1.text, ar: e.target.value}}})} />
            </div>
          </div>

          {/* BUTTON LINK (Shared) */}
          <div className="border-t-2 border-slate-100 pt-6 mb-8">
            <label className={labelClass}>Button Redirect Link (URL)</label>
            <div className="relative">
                <LinkIcon size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input 
                    className={`${inputClass} pl-10`} 
                    placeholder="/shop or https://example.com" 
                    value={formData.button1.link} 
                    onChange={(e) => setFormData({...formData, button1: {...formData.button1, link: e.target.value}})} 
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || uploadStatus !== 'success'} 
            className={`
                w-full p-5 rounded-xl font-black text-lg tracking-widest transition-all
                ${uploadStatus === 'success' ? 'bg-slate-900 text-white hover:bg-blue-700' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}
                ${loading ? 'opacity-70 animate-pulse' : ''}
            `}
          >
            {loading ? 'SAVING DATA...' : 'SAVE BANNER'}
          </button>
        </form>
      </div>
    </div>
  );
}