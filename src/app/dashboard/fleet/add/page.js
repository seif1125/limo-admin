"use client";
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Upload, X, Save, ShieldCheck,Star,CheckCircle } from 'lucide-react';
import Link from 'next/link';
import OverlayLoader from '@/components/loader';

export default function AddCarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [localImages, setLocalImages] = useState([]); 

  const [formData, setFormData] = useState({
    name_en: '', name_ar: '',
    model_en: '', model_ar: '',
    description_en: '', description_ar: '',
    year: new Date().getFullYear(),
    category: '', price: '',
    featured: false,      
    isAvailable: true,
    rentalOptions: {
      isFullDayRental: false,
      isStandardRental: true,
      isAirport:false,
      isCityToCity:false,
      fullDayHours: 12,
      limitKilometers: 100,
      extraKmCost: 0,
      extraHourCost: 0,
    },
    specs: { passengers: 4, luggage: 2, wifi: true, leatherSeats: true, fourWheel: false, gps: true, climateControl: true }
  });

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data));
  }, []);

  const isFormValid = useMemo(() => {
    const baseValid = formData.name_en && formData.name_ar && formData.category && formData.price && localImages.length > 0;
    if (formData.rentalOptions.isFullDayRental) {
      const { fullDayHours, limitKilometers, extraKmCost, extraHourCost } = formData.rentalOptions;
      return baseValid && fullDayHours > 0 && limitKilometers > 0 && extraKmCost !== '' && extraHourCost !== '';
    }
    return baseValid;
  }, [formData, localImages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage("Uploading assets...");

    try {
      const uploadedUrls = [];
      for (let img of localImages) {
        const data = new FormData();
        data.append("file", img.file);
        data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: data });
        const fileData = await res.json();
        uploadedUrls.push(fileData.secure_url);
      }

      setStatusMessage("Saving to database...");
      await api.post('/cars', { 
        ...formData, 
        images: uploadedUrls,
        price: Number(formData.price)
      });
      router.push('/dashboard/fleet');
    } catch (err) { 
      alert("Error saving car. Check all required fields."); 
    } finally { 
      setLoading(false); 
    }
  };

  const inputClass = "w-full p-3.5 rounded-xl border-2 border-slate-200 focus:border-blue-600 outline-none mb-4 font-bold text-slate-900 transition-all";
  const labelClass = "block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest";

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:p-10">
      {loading && <OverlayLoader message={statusMessage} />}
      
      <div className="max-w-5xl mx-auto bg-white p-8 md:p-12 rounded-3xl border-2 border-slate-300 shadow-2xl">
        <Link href="/dashboard/fleet" className="flex items-center gap-1 text-xs font-black text-slate-400 uppercase mb-8 hover:text-blue-600 transition-colors">
          <ArrowLeft size={16}/> Back to Inventory
        </Link>
        
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-10 text-slate-900">Add New Vehicle</h1>

        <form onSubmit={handleSubmit}>
          {/* SECTION: BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className={labelClass}>Vehicle Category</label>
              <select required className={inputClass} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name_en}</option>)}
              </select>

              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Name (EN)</label><input className={inputClass} required value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} /></div>
                <div><label className={labelClass}>Name (AR)</label><input className={inputClass} dir="rtl" required value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Model (EN)</label><input className={inputClass} required value={formData.model_en} onChange={e => setFormData({...formData, model_en: e.target.value})} /></div>
                <div><label className={labelClass}>Model (AR)</label><input className={inputClass} dir="rtl" required value={formData.model_ar} onChange={e => setFormData({...formData, model_ar: e.target.value})} /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Year</label><input type="number" className={inputClass} value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} /></div>
                <div><label className={labelClass}>Base Price ($)</label><input type="number" className={inputClass} value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Description (EN)</label>
              <textarea className={`${inputClass} h-[120px]`} value={formData.description_en} onChange={e => setFormData({...formData, description_en: e.target.value})} />
              <label className={labelClass}>Description (AR)</label>
              <textarea className={`${inputClass} h-[120px]`} dir="rtl" value={formData.description_ar} onChange={e => setFormData({...formData, description_ar: e.target.value})} />
            </div>
          </div>
            {/* STATUS & VISIBILITY TOGGLES */}
        <div className="flex flex-wrap gap-8 mb-12 p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
          {/* Available Toggle */}
          <label className="flex items-center cursor-pointer gap-4 group">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={formData.isAvailable} 
                onChange={e => setFormData({...formData, isAvailable: e.target.checked})} 
              />
              <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ease-in-out ${formData.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out flex items-center justify-center ${formData.isAvailable ? 'transform translate-x-6' : ''}`}>
                {formData.isAvailable && <CheckCircle size={14} className="text-emerald-500" />}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase text-slate-900 group-hover:text-emerald-600 transition-colors">Available</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Visible in fleet</span>
            </div>
          </label>

          {/* Featured Toggle */}
          <label className="flex items-center cursor-pointer gap-4 group">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={formData.featured} 
                onChange={e => setFormData({...formData, featured: e.target.checked})} 
              />
              <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ease-in-out ${formData.featured ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out flex items-center justify-center ${formData.featured ? 'transform translate-x-6' : ''}`}>
                 {formData.featured && <Star size={14} className="text-amber-500 fill-current" />}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase text-slate-900 group-hover:text-amber-600 transition-colors">Featured</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Show on homepage</span>
            </div>
          </label>
        </div>

          {/* SECTION: RENTAL SERVICES */}
          <div className="mb-10 p-6 bg-slate-50 rounded-2xl border-2 border-slate-100">
            <h3 className="text-[11px] font-black uppercase text-blue-600 mb-6 flex items-center gap-2">
              <ShieldCheck size={16}/> Service Availability & Constraints
            </h3>
            
            <div className="flex gap-8 mb-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 accent-blue-600" checked={formData.rentalOptions.isStandardRental} onChange={e => setFormData({...formData, rentalOptions: {...formData.rentalOptions, isStandardRental: e.target.checked}})} />
                <span className="font-black text-xs uppercase text-slate-700">Standard Rental</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 accent-blue-600" checked={formData.rentalOptions.isFullDayRental} onChange={e => setFormData({...formData, rentalOptions: {...formData.rentalOptions, isFullDayRental: e.target.checked}})} />
                <span className="font-black text-xs uppercase text-slate-700 text-blue-600">Full Day Package</span>
              </label>
              <label>
                <input type="checkbox" className="w-5 h-5 accent-blue-600" checked={formData.rentalOptions.isAirport} onChange={e => setFormData({...formData, rentalOptions: {...formData.rentalOptions, isAirport: e.target.checked}})} />
                <span className="font-black text-xs uppercase text-slate-700">Airport</span>
              </label>
              <label>
                <input type="checkbox" className="w-5 h-5 accent-blue-600" checked={formData.rentalOptions.isCityToCity} onChange={e => setFormData({...formData, rentalOptions: {...formData.rentalOptions, isCityToCity: e.target.checked}})} />
                <span className="font-black text-xs uppercase text-slate-700">City-to-City</span>
              </label>
            </div></div>

   { (formData.rentalOptions.isFullDayRental||formData.rentalOptions.isCityToCity||formData.rentalOptions.isAirport) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
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
      </div>)}
          
        
           {/* SECTION: SPECIFICATIONS */}
<div className="mb-10 p-6 bg-slate-50 rounded-2xl border-2 border-slate-100">
  <h3 className="text-[11px] font-black uppercase text-blue-600 mb-6">Technical Specifications</h3>
  
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    <div>
      <label className={labelClass}>Passengers</label>
      <input type="number" className={inputClass} value={formData.specs.passengers} onChange={e => setFormData({...formData, specs: {...formData.specs, passengers: Number(e.target.value)}})} />
    </div>
    <div>
      <label className={labelClass}>Luggage</label>
      <input type="number" className={inputClass} value={formData.specs.luggage} onChange={e => setFormData({...formData, specs: {...formData.specs, luggage: Number(e.target.value)}})} />
    </div>
  </div>

  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
    {['wifi', 'fourWheel', 'gps', 'leatherSeats', 'climateControl'].map((spec) => (
      <label key={spec} className="flex items-center gap-2 cursor-pointer bg-white p-3 rounded-xl border border-slate-200">
        <input 
          type="checkbox" 
          className="w-4 h-4 accent-blue-600" 
          checked={formData.specs[spec]} 
          onChange={e => setFormData({...formData, specs: {...formData.specs, [spec]: e.target.checked}})} 
        />
        <span className="text-[10px] font-black uppercase text-slate-700">{spec.replace(/([A-Z])/g, ' $1')}</span>
      </label>
    ))}
  </div>
</div>
          {/* SECTION: IMAGES */}
          <div className="mb-10">
            <label className={labelClass}>Media Assets ({localImages.length}/3)</label>
            <div className="border-4 border-dashed border-slate-200 p-8 rounded-2xl text-center hover:bg-slate-50 transition-colors">
              <input type="file" multiple className="hidden" id="car-files" onChange={e => {
                const files = Array.from(e.target.files).map(f => ({ file: f, preview: URL.createObjectURL(f) }));
                if (localImages.length + files.length > 3) return alert("Max 3 photos");
                setLocalImages([...localImages, ...files]);
              }} />
              <label htmlFor="car-files" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="text-blue-600" size={32} />
                <span className="font-black text-sm uppercase text-slate-900">Upload Gallery Photos</span>
              </label>
              
              <div className="flex justify-center gap-4 mt-6">
                {localImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img.preview} className="w-24 h-24 object-cover rounded-xl border-2 border-blue-600 shadow-md" />
                    <button type="button" onClick={() => setLocalImages(localImages.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform">
                      <X size={12} strokeWidth={4}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            disabled={!isFormValid || loading} 
            className={`w-full p-6 rounded-2xl font-black uppercase tracking-widest text-lg transition-all shadow-xl flex items-center justify-center gap-3
              ${isFormValid ? 'bg-slate-900 text-white hover:bg-blue-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
            `}
          >
            <Save size={20}/> {loading ? "Saving..." : "Add to Inventory"}
          </button>
        </form>
      </div>
    </div>
  );
}