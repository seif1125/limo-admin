"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Upload, MessageSquare, User } from 'lucide-react';
import Link from 'next/link';
import OverlayLoader from '@/components/loader';

export default function AddTestimonialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [image, setImage] = useState("");
  
  const [formData, setFormData] = useState({
    name: { en: '', ar: '' },
    title: { en: '', ar: '' },
    text: { en: '', ar: '' }
  });

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setStatusMsg("Uploading profile photo...");
    
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );
      const fileData = await res.json();
      setImage(fileData.secure_url);
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert("Please upload a client photo first.");

    setLoading(true);
    setStatusMsg("Publishing testimonial...");
    try {
      await api.post('/testimonials', { ...formData, imageUrl: image });
      router.push('/dashboard/testimonials');
    } catch (err) {
      alert("Failed to save testimonial. Check all fields.");
    } finally {
      setLoading(false);
    }
  };

  // Reusable Tailwind classes
  const labelClass = "block text-slate-900 font-black text-[11px] mb-2 uppercase tracking-wider";
  const inputClass = "w-full p-4 rounded-lg border-2 border-slate-300 focus:border-blue-600 focus:ring-0 bg-white text-slate-900 font-bold outline-none mb-6 transition-all placeholder:text-slate-400";
  const sectionHeaderClass = "text-blue-600 font-black text-[11px] mb-6 border-b-2 border-slate-100 pb-2 uppercase tracking-widest flex items-center gap-2";

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:py-10 md:px-6">
      {loading && <OverlayLoader message={statusMsg} />}
      
      <div className="bg-white p-6 md:p-10 rounded-2xl border-2 border-slate-300 max-w-[1100px] mx-auto shadow-xl">
        <Link href="/dashboard/testimonials" className="text-slate-500 font-extrabold flex items-center gap-1 mb-6 no-underline text-xs hover:text-blue-600 transition-colors uppercase">
          <ArrowLeft size={16} /> Back to Inventory
        </Link>

        <div className="flex items-center gap-4 mb-10">
           
            <h1 className="font-black text-2xl md:text-4xl text-slate-900 m-0 tracking-tighter uppercase">
                Add New Review
            </h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* IMAGE UPLOAD SECTION */}
          <div className={sectionHeaderClass}>Client Identification</div>
          
          <label className="group flex flex-col items-center justify-center border-4 border-dashed border-slate-200 p-8 rounded-2xl bg-slate-50 cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition-all mb-10 text-center">
            <input type="file" onChange={handleUpload} className="hidden" accept="image/*" />
            
            <div className="relative">
                {image ? (
                    <img src={image} className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-xl group-hover:scale-105 transition-transform" alt="Client Preview" />
                ) : (
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center border-2 border-slate-200 shadow-inner group-hover:border-blue-300 transition-colors">
                        <User size={48} className="text-slate-300" />
                    </div>
                )}
                <div className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white shadow-lg">
                    <Upload size={16} />
                </div>
            </div>
            
            <p className="text-slate-900 font-black mt-4 text-sm tracking-tight uppercase">
                {image ? "Change Photo" : "Upload Client Photo"}
            </p>
            <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase">Recommended: Square Aspect Ratio</p>
          </label>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            
            {/* ENGLISH SECTION */}
            <div>
              <div className={sectionHeaderClass}>English Content</div>
              
              <label className={labelClass}>Client Name (EN)</label>
              <input 
                className={inputClass} 
                placeholder="e.g. John Doe" 
                required 
                value={formData.name.en} 
                onChange={e => setFormData({...formData, name: {...formData.name, en: e.target.value}})} 
              />

              <label className={labelClass}>Position / Title (EN)</label>
              <input 
                className={inputClass} 
                placeholder="e.g. Business Traveler" 
                required 
                value={formData.title.en} 
                onChange={e => setFormData({...formData, title: {...formData.title, en: e.target.value}})} 
              />

              <label className={labelClass}>Review Text (EN)</label>
              <textarea 
                className={`${inputClass} h-40 resize-none`} 
                placeholder="Write the feedback here..." 
                required 
                value={formData.text.en} 
                onChange={e => setFormData({...formData, text: {...formData.text, en: e.target.value}})} 
              />
            </div>

            {/* ARABIC SECTION */}
            <div dir="rtl">
              <div className={`${sectionHeaderClass} flex-row-reverse`}>المحتوى العربي</div>
              
              <label className={`${labelClass} text-right`}>اسم العميل (AR)</label>
              <input 
                className={`${inputClass} text-right`} 
                placeholder="مثال: محمد أحمد" 
                required 
                value={formData.name.ar} 
                onChange={e => setFormData({...formData, name: {...formData.name, ar: e.target.value}})} 
              />

              <label className={`${labelClass} text-right`}>المسمى الوظيفي (AR)</label>
              <input 
                className={`${inputClass} text-right`} 
                placeholder="مثال: عميل دائم" 
                required 
                value={formData.title.ar} 
                onChange={e => setFormData({...formData, title: {...formData.title, ar: e.target.value}})} 
              />

              <label className={`${labelClass} text-right`}>نص التقييم (AR)</label>
              <textarea 
                className={`${inputClass} text-right h-40 resize-none`} 
                placeholder="اكتب مراجعة العميل هنا..." 
                required 
                value={formData.text.ar} 
                onChange={e => setFormData({...formData, text: {...formData.text, ar: e.target.value}})} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-slate-900 hover:bg-blue-600 text-white p-5 rounded-xl font-black text-lg tracking-widest mt-6 transition-all shadow-lg active:scale-[0.98] uppercase"
          >
            Save & Publish Testimonial
          </button>
        </form>
      </div>
    </div>
  );
}