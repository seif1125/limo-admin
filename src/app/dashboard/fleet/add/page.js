"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Upload, X, DollarSign, Car } from 'lucide-react';
import Link from 'next/link';
import OverlayLoader from '@/components/loader';

export default function AddCarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [images, setImages] = useState([]); 

  const [formData, setFormData] = useState({
    name: { en: '', ar: '' },
    make: { en: '', ar: '' },
    model: { en: '', ar: '' },
    description: { en: '', ar: '' },
    year: '',
    priceUsd: '',
    priceEgp: '',
  });

  const handleMultipleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (images.length + files.length > 3) {
      alert("Maximum 3 images allowed.");
      return;
    }

    setLoading(true);
    setStatusMessage(`Uploading assets to Cloudinary...`);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const uploadedUrls = [];

    try {
      for (const file of files) {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: data
        });
        const fileData = await res.json();
        if (fileData.secure_url) uploadedUrls.push(fileData.secure_url);
      }
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      alert("Upload failed. Check your Cloudinary credentials.");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) return alert("Please upload at least one image");

    setLoading(true);
    setStatusMessage("Syncing with Database...");

    try {
      const payload = { 
        ...formData, 
        images: images,
        year: Number(formData.year),
        priceUsd: Number(formData.priceUsd),
        priceEgp: Number(formData.priceEgp)
      };

      await api.post('/cars', payload);
      router.push('/dashboard/fleet');
    } catch (err) {
      alert("Failed to save. Check if all required fields are filled.");
    } finally {
      setLoading(false);
    }
  };

  // Reusable Tailwind classes
  const labelClass = "block text-slate-900 font-extrabold text-[13px] mb-2";
  const inputClass = "w-full p-3.5 rounded-lg border-2 border-slate-300 focus:border-black outline-none transition-all text-slate-900 font-semibold mb-5 placeholder:text-slate-400";
  const sectionHeaderClass = "text-blue-600 font-black text-[11px] mb-6 border-b-2 border-slate-100 pb-2 uppercase flex items-center gap-2 tracking-widest";

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:py-10 md:px-6">
      {loading && <OverlayLoader message={statusMessage} />}
      
      <div className="bg-white p-6 md:p-10 rounded-2xl border-2 border-slate-300 max-w-[1100px] mx-auto shadow-xl">
        <Link href="/dashboard/fleet" className="text-blue-600 font-extrabold flex items-center gap-1 mb-6 no-underline text-xs hover:text-slate-800 transition">
          <ArrowLeft size={16} /> RETURN TO LIST
        </Link>

        <h1 className="font-black text-2xl md:text-4xl text-slate-900 mb-10 tracking-tighter">
          REGISTER NEW VEHICLE
        </h1>

        <form onSubmit={handleSubmit}>
          
          {/* MEDIA UPLOAD SECTION */}
          <div className={sectionHeaderClass}><Upload size={14}/> Vehicle Media Assets ({images.length}/3)</div>
          
          <label className="block border-4 border-dashed border-blue-600 p-6 md:p-10 rounded-2xl text-center bg-blue-50 cursor-pointer hover:bg-blue-100 transition group">
            <input type="file" multiple disabled={images.length >= 3} onChange={handleMultipleImageUpload} className="hidden" accept="image/*" />
            <Upload size={36} className="mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform" />
            <p className="font-black text-sm md:text-base text-slate-900 m-0 uppercase">
              {images.length >= 3 ? "Upload Limit Reached" : "Click to Upload Car Photos"}
            </p>
            <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-tight">Attach up to 3 high-resolution images</p>
          </label>

          {/* THUMBNAIL GRID */}
          <div className="flex flex-wrap gap-4 mt-6 mb-10">
            {images.map((url, i) => (
              <div key={i} className="relative w-full sm:w-[150px] h-[100px] border-2 border-blue-600 rounded-xl overflow-hidden shadow-md">
                <img src={url} className="w-full h-full object-cover" alt="Preview" />
                <button 
                  type="button" 
                  onClick={() => removeImage(i)} 
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition shadow-lg"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>

          {/* BILINGUAL SPECIFICATIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* ENGLISH SECTION */}
            <div>
              <p className={sectionHeaderClass}>English Specification</p>
              <label className={labelClass}>Display Name</label>
              <input className={inputClass} required value={formData.name.en} onChange={(e) => setFormData({...formData, name: {...formData.name, en: e.target.value}})} placeholder="e.g. Rolls Royce Phantom" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
                <div>
                  <label className={labelClass}>Make</label>
                  <input className={inputClass} required value={formData.make.en} onChange={(e) => setFormData({...formData, make: {...formData.make, en: e.target.value}})} placeholder="Rolls Royce" />
                </div>
                <div>
                  <label className={labelClass}>Model</label>
                  <input className={inputClass} required value={formData.model.en} onChange={(e) => setFormData({...formData, model: {...formData.model, en: e.target.value}})} placeholder="Phantom" />
                </div>
              </div>

              <label className={labelClass}>Description</label>
              <textarea className={`${inputClass} h-32 resize-none`} value={formData.description.en} onChange={(e) => setFormData({...formData, description: {...formData.description, en: e.target.value}})} placeholder="Brief overview of vehicle features..." />
            </div>

            {/* ARABIC SECTION */}
            <div dir="rtl">
              <p className={`${sectionHeaderClass} flex-row-reverse`}>التفاصيل العربية</p>
              <label className={`${labelClass} text-right`}>اسم العرض</label>
              <input className={`${inputClass} text-right`} required value={formData.name.ar} onChange={(e) => setFormData({...formData, name: {...formData.name, ar: e.target.value}})} placeholder="مثال: رولز رويس فانتوم" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
                <div>
                  <label className={`${labelClass} text-right`}>الماركة</label>
                  <input className={`${inputClass} text-right`} required value={formData.make.ar} onChange={(e) => setFormData({...formData, make: {...formData.make, ar: e.target.value}})} />
                </div>
                <div>
                  <label className={`${labelClass} text-right`}>الموديل</label>
                  <input className={`${inputClass} text-right`} required value={formData.model.ar} onChange={(e) => setFormData({...formData, model: {...formData.model, ar: e.target.value}})} />
                </div>
              </div>

              <label className={`${labelClass} text-right`}>الوصف</label>
              <textarea className={`${inputClass} text-right h-32 resize-none`} value={formData.description.ar} onChange={(e) => setFormData({...formData, description: {...formData.description, ar: e.target.value}})} placeholder="موجز عن مميزات السيارة..." />
            </div>
          </div>

          {/* PRICING SECTION */}
          <div className="mt-8 bg-slate-50 p-6 md:p-8 rounded-xl border-2 border-slate-200">
            <p className={`${sectionHeaderClass} border-none mb-4`}><DollarSign size={14}/> Logistics & Pricing</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Manufacture Year</label>
                <input type="number" className={`${inputClass} mb-0`} required value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} placeholder="2024" />
              </div>
              <div>
                <label className={labelClass}>Price / Day (USD)</label>
                <input type="number" className={`${inputClass} mb-0`} required value={formData.priceUsd} onChange={(e) => setFormData({...formData, priceUsd: e.target.value})} placeholder="150" />
              </div>
              <div>
                <label className={labelClass}>Price / Day (EGP)</label>
                <input type="number" className={`${inputClass} mb-0`} required value={formData.priceEgp} onChange={(e) => setFormData({...formData, priceEgp: e.target.value})} placeholder="7500" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-xl font-black text-lg tracking-widest mt-10 hover:bg-blue-600 transition-colors uppercase shadow-lg">
            SUBMIT TO FLEET INVENTORY
          </button>
        </form>
      </div>
    </div>
  );
}