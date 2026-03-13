"use client";
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Save, X, Upload, Car, DollarSign } from 'lucide-react';
import Link from 'next/link';
import OverlayLoader from '@/components/loader';

export default function EditCarPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
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

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await api.get(`/cars/${id}`);
        const car = res.data;
        setFormData({
          name: car.name || { en: '', ar: '' },
          make: car.make || { en: '', ar: '' },
          model: car.model || { en: '', ar: '' },
          description: car.description || { en: '', ar: '' },
          year: car.year || '',
          priceUsd: car.priceUsd || '',
          priceEgp: car.priceEgp || '',
        });
        setImages(car.images || []);
      } catch (err) {
        alert("Failed to load vehicle data");
        router.push('/dashboard/fleet');
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id, router]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) return alert("Limit is 3 images");
    setActionLoading(true);
    setStatusMsg("Uploading new assets...");
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    try {
      const uploadedUrls = [];
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
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (err) {
      alert("Upload failed");
    } finally {
      setActionLoading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) return alert("At least 1 image is required");
    setActionLoading(true);
    setStatusMsg("Applying changes to database...");
    try {
      await api.put(`/cars/${id}`, { 
        ...formData, 
        images,
        year: Number(formData.year),
        priceUsd: Number(formData.priceUsd),
        priceEgp: Number(formData.priceEgp)
      });
      router.push('/dashboard/fleet');
    } catch (err) {
      alert("Update failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // Tailwind helper classes
  const labelClass = "block text-slate-900 font-extrabold text-[13px] mb-2";
  const inputClass = "w-full p-3.5 rounded-lg border-2 border-slate-300 focus:border-black bg-white outline-none transition text-slate-900 font-semibold mb-5";
  const sectionHeaderClass = "text-blue-600 font-black text-[11px] mb-6 border-b-2 border-slate-100 pb-2 uppercase flex items-center gap-2";

  if (loading) return <OverlayLoader message="Fetching Details..." />;

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:py-10 md:px-6">
      {actionLoading && <OverlayLoader message={statusMsg} />}
      
      <div className="bg-white p-6 md:p-10 rounded-2xl border-2 border-slate-300 max-w-[1100px] mx-auto shadow-xl">
        <Link href="/dashboard/fleet" className="text-blue-600 font-extrabold flex items-center gap-1 mb-6 no-underline text-xs hover:text-slate-700 transition">
          <ArrowLeft size={16} /> CANCEL CHANGES
        </Link>

        <h1 className="font-black text-2xl md:text-3xl text-slate-900 mb-10 tracking-tighter">
          EDIT VEHICLE: <span className="text-blue-600 uppercase">{formData.name.en}</span>
        </h1>

        <form onSubmit={handleSubmit}>
          {/* IMAGE SECTION */}
          <div className={sectionHeaderClass}><Upload size={14}/> Media Library ({images.length}/3)</div>
          <div className="flex flex-wrap gap-4 mb-10">
            {images.map((url, i) => (
              <div key={i} className="relative w-full sm:w-[160px] h-[120px] sm:h-[100px] border-2 border-blue-600 rounded-xl overflow-hidden shadow-md">
                <img src={url} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 border-none cursor-pointer hover:bg-red-600 transition">
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            ))}
            {images.length < 3 && (
              <label className="flex flex-col items-center justify-center w-full sm:w-[160px] h-[120px] sm:h-[100px] border-2 border-dashed border-blue-600 rounded-xl cursor-pointer hover:bg-blue-50 transition">
                <Upload size={24} className="text-blue-600 mb-1" />
                <span className="text-[10px] font-black text-slate-900">ADD MEDIA</span>
                <input type="file" multiple onChange={handleUpload} className="hidden" accept="image/*" />
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* ENGLISH SECTION */}
            <div>
              <p className={sectionHeaderClass}>English Specification</p>
              <label className={labelClass}>Display Name</label>
              <input className={inputClass} required value={formData.name.en} onChange={(e) => setFormData({...formData, name: {...formData.name, en: e.target.value}})} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Make</label>
                  <input className={inputClass} required value={formData.make.en} onChange={(e) => setFormData({...formData, make: {...formData.make, en: e.target.value}})} />
                </div>
                <div>
                  <label className={labelClass}>Model</label>
                  <input className={inputClass} required value={formData.model.en} onChange={(e) => setFormData({...formData, model: {...formData.model, en: e.target.value}})} />
                </div>
              </div>

              <label className={labelClass}>Description</label>
              <textarea className={`${inputClass} h-32 resize-none`} value={formData.description.en} onChange={(e) => setFormData({...formData, description: {...formData.description, en: e.target.value}})} />
            </div>

            {/* ARABIC SECTION */}
            <div dir="rtl">
              <p className={`${sectionHeaderClass} flex-row-reverse`}>التفاصيل العربية</p>
              <label className={`${labelClass} text-right`}>اسم العرض</label>
              <input className={`${inputClass} text-right`} required value={formData.name.ar} onChange={(e) => setFormData({...formData, name: {...formData.name, ar: e.target.value}})} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <textarea className={`${inputClass} text-right h-32 resize-none`} value={formData.description.ar} onChange={(e) => setFormData({...formData, description: {...formData.description, ar: e.target.value}})} />
            </div>
          </div>

          {/* PRICING SECTION */}
          <div className="mt-8 bg-slate-50 p-6 md:p-8 rounded-xl border-2 border-slate-200">
            <p className={`${sectionHeaderClass} border-none mb-4`}><DollarSign size={14}/> Logistics & Pricing</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Manufacture Year</label>
                <input type="number" className={`${inputClass} mb-0`} required value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Price / Day (USD)</label>
                <input type="number" className={`${inputClass} mb-0`} required value={formData.priceUsd} onChange={(e) => setFormData({...formData, priceUsd: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Price / Day (EGP)</label>
                <input type="number" className={`${inputClass} mb-0`} required value={formData.priceEgp} onChange={(e) => setFormData({...formData, priceEgp: e.target.value})} />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-xl font-black text-lg tracking-widest mt-10 hover:bg-blue-600 transition-colors flex items-center justify-center gap-3">
            <Save size={20} /> PUSH UPDATES TO FLEET
          </button>
        </form>
      </div>
    </div>
  );
}