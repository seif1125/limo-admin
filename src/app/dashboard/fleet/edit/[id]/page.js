"use client";
import { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Save, X, Upload, CheckCircle, ShieldCheck, Clock, Gauge } from 'lucide-react';
import Link from 'next/link';
import OverlayLoader from '@/components/loader';

export default function EditCarPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  // Loading & UI States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [categories, setCategories] = useState([]);

  // Data States
  const [originalSnapshot, setOriginalSnapshot] = useState("");
  const [formData, setFormData] = useState({
    name: '', model: '', year: '', category: '', price: '', description: '',
    rentalOptions: {
      isFullDayRental: false,
      isStandardRental: true,
      fullDayHours: 12,
      limitKilometers: 100,
      extraKmCost: '',
      extraHourCost: ''
    },
    specs: { passengers: 4, luggage: 2, wifi: true, fourWheel: false, gps: true, leatherSeats: true, climateControl: true }
  });

  // Image Management
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carRes, catRes] = await Promise.all([
          api.get(`/cars/${id}`),
          api.get('/categories')
        ]);

        const car = carRes.data;
        const initialForm = {
          name: car.name || '',
          model: car.model || '',
          year: String(car.year) || '',
          category: car.category?._id || car.category || '',
          price: String(car.price) || '',
          description: car.description || '',
          rentalOptions: car.rentalOptions || {
            isFullDayRental: false,
            isStandardRental: true,
            fullDayHours: 12,
            limitKilometers: 100,
            extraKmCost: '',
            extraHourCost: ''
          },
          specs: car.specs || { passengers: 4, luggage: 2, wifi: true, fourWheel: false, gps: true, leatherSeats: true, climateControl: true }
        };

        setFormData(initialForm);
        setExistingImages(car.images || []);
        setCategories(catRes.data);
        setOriginalSnapshot(JSON.stringify({ ...initialForm, images: car.images }));
      } catch (err) {
        router.push('/dashboard/fleet');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  // DIRTY & VALIDATION CHECKS
  const hasChanges = useMemo(() => {
    const currentSnapshot = JSON.stringify({ ...formData, images: existingImages });
    return currentSnapshot !== originalSnapshot || newFiles.length > 0;
  }, [formData, existingImages, newFiles, originalSnapshot]);

  const isFormValid = useMemo(() => {
    const baseValid = formData.name && formData.category && formData.price && (existingImages.length + newFiles.length > 0);
    
    if (formData.rentalOptions.isFullDayRental) {
      const { fullDayHours, limitKilometers, extraKmCost, extraHourCost } = formData.rentalOptions;
      return baseValid && fullDayHours > 0 && limitKilometers > 0 && extraKmCost !== '' && extraHourCost !== '';
    }
    return baseValid;
  }, [formData, existingImages, newFiles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || !hasChanges) return;

    setActionLoading(true);
    let finalUrls = [...existingImages];

    try {
      if (newFiles.length > 0) {
        setStatusMsg("Uploading new assets...");
        for (let item of newFiles) {
          const data = new FormData();
          data.append("file", item.file);
          data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
          const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: data });
          const fileData = await res.json();
          finalUrls.push(fileData.secure_url);
        }
      }

      setStatusMsg("Updating fleet record...");
      await api.put(`/cars/${id}`, { 
        ...formData, 
        images: finalUrls,
        year: Number(formData.year),
        price: Number(formData.price),
        rentalOptions: {
          ...formData.rentalOptions,
          fullDayHours: Number(formData.rentalOptions.fullDayHours),
          limitKilometers: Number(formData.rentalOptions.limitKilometers),
          extraKmCost: Number(formData.rentalOptions.extraKmCost),
          extraHourCost: Number(formData.rentalOptions.extraHourCost),
        }
      });

      router.push('/dashboard/fleet');
    } catch (err) {
      alert("Update failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const inputClass = "w-full p-4 rounded-xl border-2 border-slate-200 focus:border-blue-600 bg-white outline-none transition-all font-bold text-slate-900";
  const labelClass = "block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest";

  if (loading) return <OverlayLoader message="Fetching vehicle details..." />;

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:py-10">
      {actionLoading && <OverlayLoader message={statusMsg} />}

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto bg-white p-6 md:p-12 rounded-3xl border-2 border-slate-300 shadow-2xl">
        <Link href="/dashboard/fleet" className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase hover:text-blue-600 transition-colors mb-8">
          <ArrowLeft size={16} /> Discard Changes
        </Link>

        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Edit Vehicle</h1>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-tight">System ID: {id}</p>
        </header>

        {/* MEDIA MANAGEMENT */}
        <section className="mb-10">
          <div className="flex items-center gap-2 text-blue-600 font-black text-[11px] uppercase mb-4 tracking-widest">
            <Upload size={14} /> Gallery Management ({existingImages.length + newFiles.length}/3)
          </div>
          <div className="flex flex-wrap gap-4 p-6 bg-slate-50 rounded-2xl border-2 border-slate-100">
            {existingImages.map((url, i) => (
              <div key={i} className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-blue-600 shadow-lg group">
                <img src={url} className="w-full h-full object-cover" />
                <button type="button" onClick={() => setExistingImages(existingImages.filter(img => img !== url))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={12} strokeWidth={4}/></button>
              </div>
            ))}
            {newFiles.map((img, i) => (
              <div key={i} className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-dashed border-blue-400">
                <img src={img.preview} className="w-full h-full object-cover" />
                <button type="button" onClick={() => setNewFiles(newFiles.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-slate-800 text-white p-1 rounded-full"><X size={12}/></button>
              </div>
            ))}
            {existingImages.length + newFiles.length < 3 && (
              <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-white hover:border-blue-600 transition-all group">
                <Upload size={20} className="text-slate-300 group-hover:text-blue-600" />
                <input type="file" multiple onChange={(e) => {
                   const files = Array.from(e.target.files).map(f => ({ file: f, preview: URL.createObjectURL(f) }));
                   if (existingImages.length + newFiles.length + files.length > 3) return alert("Max 3 photos");
                   setNewFiles([...newFiles, ...files]);
                }} className="hidden" />
              </label>
            )}
          </div>
        </section>

        {/* BASIC INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Category Assignment</label>
              <select className={inputClass} required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Name</label><input className={inputClass} required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                <div><label className={labelClass}>Model</label><input className={inputClass} required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} /></div>
            </div>
          </div>
          <div>
            <label className={labelClass}>Daily Rate & Year</label>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <input type="number" className={inputClass} value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="Price" />
                <input type="number" className={inputClass} value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} placeholder="Year" />
            </div>
          </div>
        </div>

        {/* RENTAL SERVICES SECTION */}
        <div className="mb-10 p-6 bg-slate-50 rounded-2xl border-2 border-slate-100">
            <h3 className="text-[11px] font-black uppercase text-blue-600 mb-6 flex items-center gap-2">
                <ShieldCheck size={16}/> Service Configuration
            </h3>
            
            <div className="flex gap-8 mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-blue-600" checked={formData.rentalOptions.isStandardRental} onChange={e => setFormData({...formData, rentalOptions: {...formData.rentalOptions, isStandardRental: e.target.checked}})} />
                    <span className="font-black text-xs uppercase text-slate-700">Standard</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-blue-600" checked={formData.rentalOptions.isFullDayRental} onChange={e => setFormData({...formData, rentalOptions: {...formData.rentalOptions, isFullDayRental: e.target.checked}})} />
                    <span className="font-black text-xs uppercase text-blue-600">Full Day Package</span>
                </label>
            </div>

            {formData.rentalOptions.isFullDayRental && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
                    <div>
    <label className={labelClass}>Included Hours</label>
    <input 
        type="number" 
        min={1} 
        max={24} 
        className={inputClass} 
        // Use || '' to ensure it's never undefined
        value={formData.rentalOptions?.fullDayHours || ''} 
        onChange={e => setFormData({
            ...formData, 
            rentalOptions: {...formData.rentalOptions, fullDayHours: e.target.value}
        })} 
    />
</div>

{/* Included KM */}
<div>
    <label className={labelClass}>Included KM</label>
    <input 
        type="number" 
        min={0}
        className={inputClass} 
        value={formData.rentalOptions?.limitKilometers || ''} 
        onChange={e => setFormData({
            ...formData, 
            rentalOptions: {...formData.rentalOptions, limitKilometers: e.target.value}
        })} 
    />
</div>

{/* Extra Hour Cost */}
<div>
    <label className={labelClass}>Extra Hour $</label>
    <input 
        type="number" 
        min={0}
        className={inputClass} 
        value={formData.rentalOptions?.extraHourCost || ''} 
        onChange={e => setFormData({
            ...formData, 
            rentalOptions: {...formData.rentalOptions, extraHourCost: e.target.value}
        })} 
    />
</div>

{/* Extra KM Cost */}
<div>
    <label className={labelClass}>Extra KM $</label>
    <input 
        type="number" 
        min={0}
        className={inputClass} 
        value={formData.rentalOptions?.extraKmCost || ''} 
        onChange={e => setFormData({
            ...formData, 
            rentalOptions: {...formData.rentalOptions, extraKmCost: e.target.value}
        })} 
    />
</div>
                </div>
            )}
        </div>

        <button 
          disabled={!hasChanges || !isFormValid || actionLoading} 
          className={`w-full p-6 rounded-2xl font-black uppercase tracking-widest text-lg flex items-center justify-center gap-3 transition-all shadow-xl
            ${(hasChanges && isFormValid) ? 'bg-slate-900 text-white hover:bg-blue-600' : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'}
          `}
        >
          {actionLoading ? "Processing..." : hasChanges ? <><Save size={20} /> Update Vehicle</> : "No Changes Found"}
          {hasChanges && isFormValid && <CheckCircle size={18} />}
        </button>
      </form>
    </div>
  );
}