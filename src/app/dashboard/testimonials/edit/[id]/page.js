"use client";
import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Upload, Lock, Save } from 'lucide-react';
import Link from 'next/link';
import OverlayLoader from '@/components/loader';

export default function EditTestimonialPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("Syncing Data...");
  const [initialData, setInitialData] = useState(null); 
  
  const [image, setImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    comment: '',
    rating: 5,
    origin: ''
  });

  useEffect(() => {
    api.get(`/testimonials/${id}`).then(res => {
      const data = res.data;
      const cleanData = {
        name: data.name || '',
        title: data.title || '',
        comment: data.comment || '',
        rating: data.rating || 5,
        origin: data.origin || ''
      };
      setFormData(cleanData);
      setImage(data.image || "");
      setInitialData(JSON.stringify({ ...cleanData, image: data.image }));
      setLoading(false);
    }).catch(() => router.push('/dashboard/testimonials'));
  }, [id, router]);

  // Logic to disable button if fields are empty OR nothing changed
  const isButtonDisabled = useMemo(() => {
    const isMissingFields = !formData.name.trim() || !formData.title.trim() || !formData.comment.trim();
    const currentDataState = JSON.stringify({ ...formData, image });
    const hasNoChanges = currentDataState === initialData && !selectedFile;

    return isMissingFields || hasNoChanges;
  }, [formData, initialData, selectedFile, image]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isButtonDisabled) return;

    setLoading(true);
    let finalImageUrl = image;

    try {
      if (selectedFile) {
        setStatusMsg("Uploading new image...");
        const data = new FormData();
        data.append("file", selectedFile);
        data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: data });
        const fileData = await res.json();
        finalImageUrl = fileData.secure_url;
      }

      setStatusMsg("Saving to database...");
      await api.put(`/testimonials/${id}`, { ...formData, image: finalImageUrl });
      router.push('/dashboard/testimonials');
    } catch (err) {
      alert("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "block text-slate-900 font-black text-[11px] mb-2 uppercase tracking-wider";
  const inputClass = "w-full p-4 rounded-lg border-2 border-slate-300 focus:border-blue-600 bg-white text-slate-900 font-bold outline-none mb-6 transition-all placeholder:text-slate-300";

  if (loading) return <OverlayLoader message={statusMsg} />;

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:py-10">
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-2xl border-2 border-slate-300 max-w-[800px] mx-auto shadow-xl">
        
        {/* Top Navigation */}
        <div className="mb-10">
            <Link href="/dashboard/testimonials" className="text-slate-500 font-black flex items-center gap-1 text-xs uppercase no-underline hover:text-blue-600 transition-colors">
                <ArrowLeft size={16} /> Back to List
            </Link>
        </div>

        <h1 className="font-black text-3xl text-slate-900 mb-8 uppercase tracking-tighter">Edit Review</h1>

        {/* Image Section */}
        <div className="flex flex-col items-center mb-10">
          <label className="cursor-pointer group relative">
            <input type="file" onChange={handleImageSelect} className="hidden" accept="image/*" />
            <div className={`w-32 h-32 rounded-full overflow-hidden border-4 transition-all ${selectedFile ? 'border-blue-600 shadow-lg' : 'border-slate-200'}`}>
              <img src={previewUrl || image} className="w-full h-full object-cover" alt="Client" />
            </div>
            <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md">
              <Upload size={14} />
            </div>
          </label>
          <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">
            {selectedFile ? "New file ready" : "Change profile photo"}
          </p>
        </div>

        {/* Form Fields */}
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
            <label className={labelClass}>Origin</label>
            <input className={inputClass} value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} />
          </div>
          <div>
            <label className={labelClass}>Rating</label>
            <select className={inputClass} value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})}>
              {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Stars</option>)}
            </select>
          </div>
        </div>

        <label className={labelClass}>Comment</label>
        <textarea className={`${inputClass} h-32 resize-none`} required value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} />

        {/* Save Button (Back at the bottom) */}
        <button 
            type="submit" 
            disabled={isButtonDisabled}
            className={`w-full flex items-center justify-center gap-3 p-5 rounded-xl font-black text-lg uppercase tracking-widest transition-all mt-4 ${
                isButtonDisabled 
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed border-2 border-slate-200 shadow-none' 
                : 'bg-slate-900 text-white hover:bg-blue-600 shadow-xl active:scale-[0.98]'
            }`}
        >
            {isButtonDisabled ? <Lock size={20} /> : <Save size={20} />}
            Save Changes
        </button>
      </form>
    </div>
  );
}