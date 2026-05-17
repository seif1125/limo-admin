"use client";
import { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Save, X, Upload, Clock, Settings2, ShieldCheck, Camera } from 'lucide-react';
import Link from 'next/link';
import OverlayLoader from '@/components/loader';

export default function EditCarPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [categories, setCategories] = useState([]);
  
  const [originalSnapshot, setOriginalSnapshot] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  const [formData, setFormData] = useState({
    name_en: '', name_ar: '',
    model_en: '', model_ar: '',
    description_en: '', description_ar: '',
    year: new Date().getFullYear(),
    category: '', price: '',
    featured: false, isAvailable: true,
    rentalOptions: {
      isFullDayRental: false, isStandardRental: true,
      isAirport: false, isCityToCity: false,
      fullDayHours: 12, limitKilometers: 100, extraKmCost: '', extraHourCost: ''
    },
    specs: { passengers: 4, luggage: 2, wifi: true, fourWheel: false, gps: true, leatherSeats: true, climateControl: true }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carRes, catRes] = await Promise.all([api.get(`/cars/${id}`), api.get('/categories')]);
        const car = carRes.data;
        
        const cleanedData = {
          name_en: car.name_en || '', name_ar: car.name_ar || '',
          model_en: car.model_en || '', model_ar: car.model_ar || '',
          description_en: car.description_en || '', description_ar: car.description_ar || '',
          year: car.year || new Date().getFullYear(),
          category: car.category?._id || car.category || '',
          price: car.price || '',
          featured: car.featured ?? false,
          isAvailable: car.isAvailable ?? true,
          rentalOptions: { ...formData.rentalOptions, ...car.rentalOptions },
          specs: { ...formData.specs, ...car.specs }
        };

        setFormData(cleanedData);
        setExistingImages(car.images || []);
        setCategories(catRes.data);
        setOriginalSnapshot(JSON.stringify({ ...cleanedData, images: car.images }));
      } catch (err) { router.push('/dashboard/fleet'); } finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const hasChanges = useMemo(() => {
    const currentSnapshot = JSON.stringify({ ...formData, images: existingImages });
    return currentSnapshot !== originalSnapshot || newFiles.length > 0;
  }, [formData, existingImages, newFiles, originalSnapshot]);

  const isFormValid = useMemo(() => {
    const { name_en, name_ar, category, price, rentalOptions } = formData;
    const hasMedia = existingImages.length + newFiles.length > 0;
    const base = name_en && name_ar && category && price && hasMedia;
    const extraFieldsRequired = rentalOptions.isFullDayRental || rentalOptions.isAirport || rentalOptions.isCityToCity;
    
    if (extraFieldsRequired) {
        return base && rentalOptions.fullDayHours > 0 && rentalOptions.limitKilometers > 0 && rentalOptions.extraKmCost !== '' && rentalOptions.extraHourCost !== '';
    }
    return base;
  }, [formData, existingImages, newFiles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || !hasChanges) return;
    setActionLoading(true);
    let finalUrls = [...existingImages];
    try {
      if (newFiles.length > 0) {
        setStatusMsg("Uploading assets...");
        for (let item of newFiles) {
          const data = new FormData();
          data.append("file", item.file);
          data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
          const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: data });
          const fileData = await res.json();
          finalUrls.push(fileData.secure_url);
        }
      }
      await api.put(`/cars/${id}`, { ...formData, images: finalUrls, year: Number(formData.year), price: Number(formData.price) });
      router.push('/dashboard/fleet');
    } catch (err) { alert("Update failed."); } finally { setActionLoading(false); }
  };

  const inputClass = "w-full p-4 rounded-xl border-2 border-slate-200 focus:border-blue-600 bg-white outline-none transition-all font-bold text-slate-900";
  const labelClass = "block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest";

  if (loading) return <OverlayLoader message="Loading vehicle..." />;

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:py-10">
      {actionLoading && <OverlayLoader message={statusMsg} />}
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto bg-white p-6 md:p-12 rounded-[2.5rem] border-2 border-slate-200 shadow-2xl">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-10">
            <Link href="/dashboard/fleet" className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><ArrowLeft size={16} /> Back</Link>
        </div>

        {/* GALLERY SECTION */}
        <section className="mb-12">
          <label className={labelClass}>Vehicle Gallery</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            {existingImages.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-blue-600">
                <img src={url} className="w-full h-full object-cover" />
                <button type="button" onClick={() => setExistingImages(existingImages.filter(img => img !== url))} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg"><X size={14}/></button>
              </div>
            ))}
            {newFiles.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-blue-400">
                <img src={img.preview} className="w-full h-full object-cover opacity-70" />
                <button type="button" onClick={() => setNewFiles(newFiles.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 bg-slate-800 text-white p-1.5 rounded-lg"><X size={14}/></button>
              </div>
            ))}
            <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer">
              <Camera size={24} className="text-slate-300" />
              <input type="file" multiple className="hidden" onChange={(e) => {
                 const files = Array.from(e.target.files).map(f => ({ file: f, preview: URL.createObjectURL(f) }));
                 setNewFiles([...newFiles, ...files]);
              }} />
            </label>
          </div>
        </section>

        {/* Main Inputs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
            <div className="space-y-6">
                <h3 className="text-xs font-black uppercase text-slate-900 border-b pb-4"><Settings2 size={16}/> Basic Details</h3>
                <label className={labelClass}>Category</label>
                <select className={inputClass} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name_en}</option>)}
                </select>
                <div><label className={labelClass}>Name (EN)</label><input className={inputClass} value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} /></div>
                <div><label className={labelClass}>Name (AR)</label><input className={inputClass} dir="rtl" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} /></div>
            </div>

            <div className="space-y-6">
                <h3 className="text-xs font-black uppercase text-slate-900 border-b pb-4"><ShieldCheck size={16}/> Technical Specs</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelClass}>Passengers</label><input type="number" className={inputClass} value={formData.specs.passengers} onChange={e => setFormData({...formData, specs: {...formData.specs, passengers: Number(e.target.value)}})} /></div>
                    <div><label className={labelClass}>Luggage</label><input type="number" className={inputClass} value={formData.specs.luggage} onChange={e => setFormData({...formData, specs: {...formData.specs, luggage: Number(e.target.value)}})} /></div>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-xs font-black uppercase text-slate-900 border-b pb-4">Description</h3>
                <div><label className={labelClass}>Description (EN)</label><textarea className={`${inputClass} h-[100px]`} value={formData.description_en} onChange={e => setFormData({...formData, description_en: e.target.value})} /></div>
                <div><label className={labelClass}>Description (AR)</label><textarea className={`${inputClass} h-[100px]`} dir="rtl" value={formData.description_ar} onChange={e => setFormData({...formData, description_ar: e.target.value})} /></div>
            </div>
        </div>

        {/* SERVICE PACKAGES */}
        <div className="mb-12 p-8 bg-slate-50 rounded-3xl border-2 border-slate-100">
            <h3 className="text-xs font-black uppercase text-slate-900 border-b pb-4 mb-6 flex items-center gap-2"><Clock size={16}/> Service Packages</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[ { key: 'isStandardRental', label: 'Standard' }, { key: 'isFullDayRental', label: 'Full Day' }, { key: 'isAirport', label: 'Airport' }, { key: 'isCityToCity', label: 'City-to-City' } ].map(item => (
                    <label key={item.key} className={`cursor-pointer p-4 rounded-2xl border-2 transition-all text-center ${formData.rentalOptions[item.key] ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200'}`}>
                        <input type="checkbox" className="hidden" checked={formData.rentalOptions[item.key]} onChange={e => setFormData({...formData, rentalOptions: {...formData.rentalOptions, [item.key]: e.target.checked}})} />
                        <span className="text-[10px] font-black uppercase">{item.label}</span>
                    </label>
                ))}
            </div>

            {(formData.rentalOptions.isFullDayRental || formData.rentalOptions.isAirport || formData.rentalOptions.isCityToCity) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-200">
                    <div><label className={labelClass}>Inc. Hours</label><input type="number" className={inputClass} value={formData.rentalOptions.fullDayHours} onChange={e => setFormData({...formData, rentalOptions: {...formData.rentalOptions, fullDayHours: Number(e.target.value)}})} /></div>
                    <div><label className={labelClass}>Inc. KM</label><input type="number" className={inputClass} value={formData.rentalOptions.limitKilometers} onChange={e => setFormData({...formData, rentalOptions: {...formData.rentalOptions, limitKilometers: Number(e.target.value)}})} /></div>
                    <div><label className={labelClass}>Extra Hour ($)</label><input type="number" className={inputClass} value={formData.rentalOptions.extraHourCost} onChange={e => setFormData({...formData, rentalOptions: {...formData.rentalOptions, extraHourCost: Number(e.target.value)}})} /></div>
                    <div><label className={labelClass}>Extra KM ($)</label><input type="number" className={inputClass} value={formData.rentalOptions.extraKmCost} onChange={e => setFormData({...formData, rentalOptions: {...formData.rentalOptions, extraKmCost: Number(e.target.value)}})} /></div>
                </div>
            )}
        </div>

        <button disabled={!isFormValid || !hasChanges || actionLoading} className="w-full p-8 rounded-[2rem] bg-slate-900 text-white font-black uppercase tracking-[0.2em]">
          {actionLoading ? "Updating..." : "Commit Changes"}
        </button>
      </form>
    </div>
  );
}