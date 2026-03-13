"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Upload, MessageSquare, User, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import OverlayLoader from '@/components/loader';

export default function EditTestimonialPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("Fetching record...");
  const [image, setImage] = useState("");
  
  const [formData, setFormData] = useState({
    name: { en: '', ar: '' },
    title: { en: '', ar: '' },
    text: { en: '', ar: '' }
  });

  // Load existing data
  useEffect(() => {
    const fetchTestimonial = async () => {
      try {
        const res = await api.get(`/testimonials/${id}`);
        const data = res.data;
        setFormData({
          name: { en: data.name?.en || '', ar: data.name?.ar || '' },
          title: { en: data.title?.en || '', ar: data.title?.ar || '' },
          text: { en: data.text?.en || '', ar: data.text?.ar || '' }
        });
        setImage(data.imageUrl || "");
      } catch (err) {
        alert("Could not load testimonial data.");
        router.push('/dashboard/testimonials');
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonial();
  }, [id, router]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setStatusMsg("Updating profile photo...");
    
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
    setLoading(true);
    setStatusMsg("Saving changes...");
    try {
      await api.put(`/testimonials/${id}`, { ...formData, imageUrl: image });
      router.push('/dashboard/testimonials');
    } catch (err) {
      alert("Failed to update testimonial.");
    } finally {
      setLoading(false);
    }
  };

  const css = {
    page: { backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '40px 20px' },
    card: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', border: '2px solid #cbd5e1', maxWidth: '1100px', margin: '0 auto' },
    label: { display: 'block', color: '#000', fontWeight: '900', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase' },
    input: { width: '100%', padding: '14px', borderRadius: '8px', border: '2px solid #cbd5e1', color: '#000', fontWeight: '700', marginBottom: '20px', outline: 'none', fontSize: '15px' },
    sectionHeader: { color: '#2563eb', fontWeight: '900', fontSize: '11px', marginBottom: '25px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' },
    uploadArea: { 
        border: '3px dashed #cbd5e1', padding: '30px', borderRadius: '12px', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', cursor: 'pointer', background: '#f8fafc', transition: 'all 0.2s', marginBottom: '30px' 
    }
  };

  return (
    <div style={css.page}>
      {loading && <OverlayLoader message={statusMsg} />}
      
      <div style={css.card}>
        <Link href="/dashboard/testimonials" style={{ color: '#64748b', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '25px', textDecoration: 'none', fontSize: '13px' }}>
          <ArrowLeft size={16} /> CANCEL & GO BACK
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
            <RefreshCw color="#2563eb" size={32} />
            <h1 style={{ fontWeight: '900', fontSize: '32px', color: '#000', margin: 0, letterSpacing: '-1px' }}>EDIT TESTIMONIAL</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* IMAGE UPDATE SECTION */}
          <div style={css.sectionHeader}>Client Identification</div>
          <label style={css.uploadArea} className="hover-blue">
            <input type="file" onChange={handleUpload} style={{ display: 'none' }} accept="image/*" />
            {image ? (
                <img src={image} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #2563eb' }} />
            ) : (
                <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '50%', border: '2px solid #cbd5e1' }}>
                    <User size={40} color="#94a3b8" />
                </div>
            )}
            <p style={{ color: '#000', fontWeight: '900', marginTop: '15px', fontSize: '14px' }}>
                CHANGE PROFILE PHOTO
            </p>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px' }}>
            {/* ENGLISH SECTION */}
            <div>
              <div style={css.sectionHeader}>English Content</div>
              <label style={css.label}>Client Name (EN)</label>
              <input 
                style={css.input} 
                required 
                value={formData.name.en} 
                onChange={e => setFormData({...formData, name: {...formData.name, en: e.target.value}})} 
              />
              <label style={css.label}>Position / Title (EN)</label>
              <input 
                style={css.input} 
                required 
                value={formData.title.en} 
                onChange={e => setFormData({...formData, title: {...formData.title, en: e.target.value}})} 
              />
              <label style={css.label}>Review Text (EN)</label>
              <textarea 
                style={{ ...css.input, height: '150px', resize: 'none' }} 
                required 
                value={formData.text.en} 
                onChange={e => setFormData({...formData, text: {...formData.text, en: e.target.value}})} 
              />
            </div>

            {/* ARABIC SECTION */}
            <div dir="rtl">
              <div style={{ ...css.sectionHeader, textAlign: 'right' }}>المحتوى العربي</div>
              <label style={{ ...css.label, textAlign: 'right' }}>اسم العميل (AR)</label>
              <input 
                style={{ ...css.input, textAlign: 'right' }} 
                required 
                value={formData.name.ar} 
                onChange={e => setFormData({...formData, name: {...formData.name, ar: e.target.value}})} 
              />
              <label style={{ ...css.label, textAlign: 'right' }}>المسمى الوظيفي (AR)</label>
              <input 
                style={{ ...css.input, textAlign: 'right' }} 
                required 
                value={formData.title.ar} 
                onChange={e => setFormData({...formData, title: {...formData.title, ar: e.target.value}})} 
              />
              <label style={{ ...css.label, textAlign: 'right' }}>نص التقييم (AR)</label>
              <textarea 
                style={{ ...css.input, textAlign: 'right', height: '150px', resize: 'none' }} 
                required 
                value={formData.text.ar} 
                onChange={e => setFormData({...formData, text: {...formData.text, ar: e.target.value}})} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            style={{ 
                width: '100%', backgroundColor: '#000', color: '#fff', padding: '20px', 
                borderRadius: '12px', fontWeight: '900', border: 'none', cursor: 'pointer', 
                marginTop: '20px', fontSize: '16px', letterSpacing: '1px' 
            }}
          >
            UPDATE TESTIMONIAL
          </button>
        </form>
      </div>

      <style jsx>{`
        .hover-blue:hover {
            border-color: #2563eb !important;
            background-color: #eff6ff !important;
        }
      `}</style>
    </div>
  );
}