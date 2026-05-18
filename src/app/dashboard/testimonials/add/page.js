"use client";
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Upload, User, X } from 'lucide-react';
import Link from 'next/link';
import OverlayLoader from '@/components/loader';

export default function AddTestimonialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [localImage, setLocalImage] = useState(null); // Stores { file, preview }
  
  const [formData, setFormData] = useState({
    name_en: '', name_ar: '',
    title_en: '', title_ar: '',
    comment_en: '', comment_ar: '',
    rating: 5,
    origin_en: '', origin_ar: ''
  });

  // Handle local image picking with preview
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLocalImage({
        file,
        preview: URL.createObjectURL(file)
      });
    }
  };

  // Validate form locally before firing requests
  const isFormValid = useMemo(() => {
    return (
      formData.name_en && 
      formData.name_ar && 
      formData.title_en && 
      formData.title_ar && 
      formData.comment_en && 
      formData.comment_ar && 
      localImage
    );
  }, [formData, localImage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setStatusMessage("Uploading client photo...");

    try {
      // 1. Upload to Cloudinary only when user commits
      const data = new FormData();
      data.append("file", localImage.file);
      data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, 
        { method: "POST", body: data }
      );
      
      const fileData = await cloudinaryRes.json();

      if (!cloudinaryRes.ok) {
        throw new Error(fileData.error?.message || "Cloudinary upload failed");
      }

      // 2. Save to database with Cloudinary secure URL
      setStatusMessage("Publishing testimonial...");
      await api.post('/testimonials', { 
        ...formData, 
        image: fileData.secure_url 
      });

      router.push('/dashboard/testimonials');
    } catch (err) { 
      console.error(err);
      alert(err.message || "Failed to save testimonial"); 
    } finally { 
      setLoading(false); 
      setStatusMessage("");
    }
  };

  const labelClass = "block text-slate-900 font-black text-[11px] mb-2 uppercase tracking-wider";
  const inputClass = "w-full p-4 rounded-lg border-2 border-slate-300 focus:border-blue-600 bg-white text-slate-900 font-bold outline-none mb-6 transition-all";

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:py-10">
      {loading && <OverlayLoader message={statusMessage} />}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-2xl border-2 border-slate-300 max-w-[800px] mx-auto shadow-xl">
        <Link href="/dashboard/testimonials" className="text-slate-500 font-black flex items-center gap-1 mb-6 text-xs uppercase hover:text-blue-600 transition-colors">
          <ArrowLeft size={16} /> Back to Testimonials
        </Link>

        <h1 className="font-black text-3xl text-slate-900 mb-10 uppercase tracking-tighter">Add Review</h1>

        {/* PROFILE PHOTO SELECTOR */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group">
            {localImage ? (
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-600 shadow-md">
                <img src={localImage.preview} className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => setLocalImage(null)} 
                  className="absolute -top-1 -right-1 bg-red-600 text-white p-1.5 rounded-full shadow-md hover:scale-110 transition-transform"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <input type="file" onChange={handleImageSelect} accept="image/*" className="hidden" />
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 bg-slate-50 flex flex-col items-center justify-center group-hover:border-blue-600 group-hover:bg-blue-50 transition-all shadow-inner">
                  <User size={36} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                  <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-blue-500 mt-1">Add Photo</span>
                </div>
                <div className="absolute bottom-0 right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg group-hover:bg-slate-900 transition-colors">
                  <Upload size={14} />
                </div>
              </label>
            )}
          </div>
          <p className="font-black text-[10px] uppercase mt-4 text-slate-400 tracking-widest">Client Profile Image</p>
        </div>

        {/* NAME */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div>
            <label className={labelClass}>Name (EN)</label>
            <input className={inputClass} required value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} />
          </div>
          <div>
            <label className={labelClass}>Name (AR)</label>
            <input className={inputClass} dir="rtl" required value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} />
          </div>
        </div>

        {/* TITLE / ROLE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div>
            <label className={labelClass}>Title / Subtitle (EN)</label>
            <input className={inputClass} required placeholder="e.g. CEO, Business Owner" value={formData.title_en} onChange={e => setFormData({...formData, title_en: e.target.value})} />
          </div>
          <div>
            <label className={labelClass}>Title / Subtitle (AR)</label>
            <input className={inputClass} dir="rtl" required placeholder="مثال: مدير تنفيذي" value={formData.title_ar} onChange={e => setFormData({...formData, title_ar: e.target.value})} />
          </div>
        </div>

        {/* ORIGIN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div>
            <label className={labelClass}>Origin (Country/City)</label>
            <input className={inputClass} value={formData.origin_en} onChange={e => setFormData({...formData, origin_en: e.target.value})} placeholder="e.g. Egypt" />
          </div>
          <div>
            <label className={labelClass}>Origin (AR)</label>
            <input className={inputClass} dir="rtl" value={formData.origin_ar} onChange={e => setFormData({...formData, origin_ar: e.target.value})} placeholder="مثال: مصر" />
          </div>
        </div>

        {/* RATING */}
        <div className='w-full'>
          <label className={labelClass}>Rating (1-5)</label>
          <select className={inputClass} value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})}>
            {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Stars</option>)}
          </select>
        </div>

        {/* COMMENTS */}
        <label className={labelClass}>Review Comment (EN)</label>
        <textarea className={`${inputClass} h-32 resize-none`} required value={formData.comment_en} onChange={e => setFormData({...formData, comment_en: e.target.value})} />
        
        <label className={labelClass}>Review Comment (AR)</label>
        <textarea className={`${inputClass} h-32 resize-none`} dir="rtl" required value={formData.comment_ar} onChange={e => setFormData({...formData, comment_ar: e.target.value})} />
        
        <button 
          type="submit" 
          disabled={!isFormValid || loading}
          className={`w-full p-5 rounded-xl font-black text-lg uppercase tracking-widest transition-all shadow-lg
            ${isFormValid ? 'bg-slate-900 hover:bg-blue-600 text-white cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
          `}
        >
          Publish Testimonial
        </button>
      </form>
    </div>
  );
}