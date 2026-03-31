"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Upload, User, Star } from 'lucide-react';
import Link from 'next/link';
import OverlayLoader from '@/components/loader';

export default function AddTestimonialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    comment: '',
    rating: 5,
    origin: ''
  });

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: data });
      const fileData = await res.json();
      setImage(fileData.secure_url);
    } catch (err) { alert("Upload failed"); } 
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert("Upload photo first");
    setLoading(true);
    try {
      await api.post('/testimonials', { ...formData, image });
      router.push('/dashboard/testimonials');
    } catch (err) { alert("Failed to save"); } 
    finally { setLoading(false); }
  };

  const labelClass = "block text-slate-900 font-black text-[11px] mb-2 uppercase tracking-wider";
  const inputClass = "w-full p-4 rounded-lg border-2 border-slate-300 focus:border-blue-600 bg-white text-slate-900 font-bold outline-none mb-6 transition-all";

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:py-10">
      {loading && <OverlayLoader message="Processing..." />}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-2xl border-2 border-slate-300 max-w-[800px] mx-auto shadow-xl">
        <Link href="/dashboard/testimonials" className="text-slate-500 font-black flex items-center gap-1 mb-6 text-xs uppercase"><ArrowLeft size={16} /> Back</Link>

        <h1 className="font-black text-3xl text-slate-900 mb-10 uppercase tracking-tighter">Add Review</h1>

        <div className="flex flex-col items-center mb-10">
          <label className="cursor-pointer group relative">
            <input type="file" onChange={handleUpload} className="hidden" />
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 group-hover:border-blue-600 transition-all">
              {image ? <img src={image} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-50 flex items-center justify-center"><User size={40} className="text-slate-300" /></div>}
            </div>
            <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg"><Upload size={14} /></div>
          </label>
          <p className="font-black text-[10px] uppercase mt-4 text-slate-400">Client Profile Image</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div>
            <label className={labelClass}>Full Name</label>
            <input className={inputClass} required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className={labelClass}>Company / Title</label>
            <input className={inputClass} required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div>
            <label className={labelClass}>Origin (Country/City)</label>
            <input className={inputClass} value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} placeholder="e.g. Egypt" />
          </div>
          <div>
            <label className={labelClass}>Rating (1-5)</label>
            <select className={inputClass} value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})}>
              {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Stars</option>)}
            </select>
          </div>
        </div>

        <label className={labelClass}>Review Comment</label>
        <textarea className={`${inputClass} h-32 resize-none`} required value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} />

        <button type="submit" className="w-full bg-slate-900 hover:bg-blue-600 text-white p-5 rounded-xl font-black text-lg uppercase tracking-widest transition-all shadow-lg">
          Publish Testimonial
        </button>
      </form>
    </div>
  );
}