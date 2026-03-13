"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Upload, Save, CheckCircle, Loader2, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export default function AddBannerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [formData, setFormData] = useState({
    title: { en: '', ar: '' },
    subtitle: { en: '', ar: '' },
    imageUrl: '',
    button1: { text: { en: '', ar: '' }, link: '' }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadStatus('uploading');
    
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        console.error("Missing Cloudinary Env Variables");
        setUploadStatus('error');
        return;
    }

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset); 

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: data }
      );
      
      const fileData = await res.json();
      
      if (res.ok && fileData.secure_url) {
        setFormData((prev) => ({ ...prev, imageUrl: fileData.secure_url }));
        setUploadStatus('success');
      } else {
        setUploadStatus('error');
        console.error("Cloudinary Detailed Error:", JSON.stringify(fileData));
      }
    } catch (err) {
      setUploadStatus('error');
      console.error("Network Error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Using the stored API URL preference, fallback to localhost:5050
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
      await api.post(`${apiUrl}/banners`, formData); 
      router.push('/dashboard/banners');
    } catch (err) {
      console.error(err);
      alert("Connection failed. Check your Backend Terminal for the 400/500 error details.");
    } finally {
      setLoading(false);
    }
  };

  const css = {
    page: { backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '40px 20px' },
    card: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', border: '2px solid #cbd5e1', maxWidth: '1000px', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
    label: { display: 'block', color: '#000000', fontWeight: '900', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #cbd5e1', fontSize: '15px', color: '#000000', marginBottom: '15px', boxSizing: 'border-box' },
    uploadBox: { 
      border: '3px dashed #2563eb', borderRadius: '15px', padding: '40px', textAlign: 'center', 
      backgroundColor: '#f0f7ff', cursor: 'pointer', display: 'block', marginBottom: '40px'
    },
    sectionTitle: { color: '#2563eb', fontWeight: '900', fontSize: '12px', marginBottom: '15px', borderBottom: '2px solid #e2e8f0', paddingBottom: '5px' },
    saveBtn: { 
        backgroundColor: '#000000', color: '#ffffff', width: '100%', padding: '18px', 
        borderRadius: '12px', fontWeight: '900', border: 'none', cursor: 'pointer', 
        fontSize: '16px', letterSpacing: '1px', marginTop: '20px'
    }
  };

  return (
    <div style={css.page}>
      <div style={css.card}>
        <Link href="/dashboard/banners" style={{ color: '#2563eb', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '25px', textDecoration: 'none' }}>
          <ArrowLeft size={18} /> BACK TO LIST
        </Link>

        <h1 style={{ color: '#000000', fontSize: '32px', fontWeight: '900', marginBottom: '40px', borderLeft: '8px solid #2563eb', paddingLeft: '15px' }}>
            ADD NEW BANNER
        </h1>

        <form onSubmit={handleSubmit}>
          {/* UPLOAD SECTION */}
          <label style={css.uploadBox}>
            <input type="file" onChange={handleImageUpload} style={{ display: 'none' }} />
            {uploadStatus === 'uploading' && (
              <div style={{ color: '#2563eb' }}>
                <Loader2 className="animate-spin" style={{ margin: '0 auto 10px' }} size={40} />
                <p style={{ fontWeight: '900' }}>UPLOADING TO CLOUDINARY...</p>
              </div>
            )}
            {uploadStatus === 'success' && (
              <div style={{ color: '#059669' }}>
                <CheckCircle style={{ margin: '0 auto 10px' }} size={40} />
                <p style={{ fontWeight: '900' }}>IMAGE UPLOADED</p>
                <img src={formData.imageUrl} style={{ height: '120px', borderRadius: '8px', marginTop: '10px', border: '2px solid #059669' }} alt="preview" />
              </div>
            )}
            {uploadStatus === 'idle' && (
              <div style={{ color: '#2563eb' }}>
                <Upload size={40} style={{ margin: '0 auto 10px' }} />
                <p style={{ color: '#000000', fontWeight: '900' }}>CLICK TO UPLOAD IMAGE</p>
              </div>
            )}
          </label>

          {/* DUAL LANGUAGE CONTENT */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            {/* ENGLISH COLUMN */}
            <div>
              <p style={css.sectionTitle}>ENGLISH CONTENT</p>
              
              <label style={css.label}>Main Title</label>
              <input style={css.input} required value={formData.title.en} onChange={(e) => setFormData({...formData, title: {...formData.title, en: e.target.value}})} />
              
              <label style={css.label}>Subtitle</label>
              <input style={css.input} value={formData.subtitle.en} onChange={(e) => setFormData({...formData, subtitle: {...formData.subtitle, en: e.target.value}})} />
              
              <label style={css.label}>Button Text</label>
              <input style={css.input} placeholder="e.g. Shop Now" value={formData.button1.text.en} onChange={(e) => setFormData({...formData, button1: {...formData.button1, text: {...formData.button1.text, en: e.target.value}}})} />
            </div>

            {/* ARABIC COLUMN */}
            <div dir="rtl">
              <p style={{...css.sectionTitle, textAlign: 'right'}}>المحتوى العربي</p>
              
              <label style={{...css.label, textAlign: 'right'}}>العنوان الرئيسي</label>
              <input style={{...css.input, textAlign: 'right'}} required value={formData.title.ar} onChange={(e) => setFormData({...formData, title: {...formData.title, ar: e.target.value}})} />
              
              <label style={{...css.label, textAlign: 'right'}}>العنوان الفرعي</label>
              <input style={{...css.input, textAlign: 'right'}} value={formData.subtitle.ar} onChange={(e) => setFormData({...formData, subtitle: {...formData.subtitle, ar: e.target.value}})} />
              
              <label style={{...css.label, textAlign: 'right'}}>نص الزر</label>
              <input style={{...css.input, textAlign: 'right'}} placeholder="مثلاً: تسوق الآن" value={formData.button1.text.ar} onChange={(e) => setFormData({...formData, button1: {...formData.button1, text: {...formData.button1.text, ar: e.target.value}}})} />
            </div>
          </div>

          {/* BUTTON LINK (Shared) */}
          <div style={{ marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <label style={css.label}>Button Redirect Link (URL)</label>
            <div style={{ position: 'relative' }}>
                <LinkIcon size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
                <input 
                    style={{ ...css.input, paddingLeft: '40px' }} 
                    placeholder="/shop or https://example.com" 
                    value={formData.button1.link} 
                    onChange={(e) => setFormData({...formData, button1: {...formData.button1, link: e.target.value}})} 
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || uploadStatus !== 'success'} 
            style={{ 
              ...css.saveBtn,
              backgroundColor: uploadStatus === 'success' ? '#000000' : '#cbd5e1', 
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'SAVING TO DATABASE...' : 'SAVE BANNER'}
          </button>
        </form>
      </div>
    </div>
  );
}