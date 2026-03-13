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
      console.error("Submission error:", err.response?.data || err.message);
      alert("Failed to save. Check if all required fields are filled.");
    } finally {
      setLoading(false);
    }
  };

  // Re-usable CSS object for consistency
  const css = {
    page: { backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '40px 20px' },
    card: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', border: '2px solid #cbd5e1', maxWidth: '1100px', margin: '0 auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
    sectionLabel: { color: '#2563eb', fontWeight: '900', fontSize: '11px', marginBottom: '25px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' },
    label: { display: 'block', color: '#000000', fontWeight: '800', fontSize: '13px', marginBottom: '8px' },
    input: { width: '100%', padding: '14px', borderRadius: '8px', border: '2px solid #cbd5e1', fontSize: '15px', marginBottom: '20px', outline: 'none', transition: 'all 0.2s', color: '#000000', fontWeight: '600' },
  };

  return (
    <div style={css.page}>
      {loading && <OverlayLoader message={statusMessage} />}
      
      <div style={css.card}>
        <Link href="/dashboard/fleet" style={{ color: '#64748b', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '25px', textDecoration: 'none', fontSize: '13px' }}>
          <ArrowLeft size={16} /> RETURN TO LIST
        </Link>

        <h1 style={{ fontWeight: '900', fontSize: '32px', color: '#0f172a', marginBottom: '40px', letterSpacing: '-1.5px' }}>
          REGISTER NEW VEHICLE
        </h1>

        <form onSubmit={handleSubmit}>
          
          {/* ENHANCED MEDIA UPLOAD SECTION */}
          <div style={css.sectionLabel}><Upload size={14}/> Vehicle Media Assets ({images.length}/3)</div>
          <label className="upload-label">
            <input type="file" multiple disabled={images.length >= 3} onChange={handleMultipleImageUpload} style={{ display: 'none' }} accept="image/*" />
            <Upload size={36} style={{ margin: '0 auto 10px', color: '#2563eb' }} />
            <p style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a', margin: 0 }}>
              {images.length >= 3 ? "Upload Limit Reached" : "Drag & Drop or Click to Upload Car Photos"}
            </p>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Attach up to 3 high-resolution images</p>
          </label>

          {/* ORGANIZED THUMBNAIL GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px', marginTop: '20px', marginBottom: '40px' }}>
            {images.map((url, i) => (
              <div key={i} style={{ position: 'relative', width: '150px', height: '100px', border: '3px solid #2563eb', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: '5px', right: '5px', backgroundColor: 'rgba(239, 68, 68, 0.9)', border: 'none', color: '#fff', borderRadius: '50%', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>

          {/* BILINGUAL SPECIFICATIONS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            
            {/* ENGLISH SECTION */}
            <div>
              <p style={css.sectionLabel}>English Specification</p>
              <label style={css.label}>Display Name</label>
              <input style={css.input} className="enhanced-input" required value={formData.name.en} onChange={(e) => setFormData({...formData, name: {...formData.name, en: e.target.value}})} placeholder="e.g. Rolls Royce Phantom" />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={css.label}>Make</label>
                  <input style={css.input} className="enhanced-input" required value={formData.make.en} onChange={(e) => setFormData({...formData, make: {...formData.make, en: e.target.value}})} placeholder="Rolls Royce" />
                </div>
                <div>
                  <label style={css.label}>Model</label>
                  <input style={css.input} className="enhanced-input" required value={formData.model.en} onChange={(e) => setFormData({...formData, model: {...formData.model, en: e.target.value}})} placeholder="Phantom" />
                </div>
              </div>

              <label style={css.label}>Description</label>
              <textarea style={{ ...css.input, height: '140px', resize: 'none', marginBottom: '10px' }} className="enhanced-input" value={formData.description.en} onChange={(e) => setFormData({...formData, description: {...formData.description, en: e.target.value}})} placeholder="Brief overview of vehicle features..." />
            </div>

            {/* ARABIC SECTION */}
            <div dir="rtl">
              <p style={{ ...css.sectionLabel, flexDirection: 'row-reverse' }}>التفاصيل العربية</p>
              <label style={{ ...css.label, textAlign: 'right' }}>اسم العرض</label>
              <input style={{ ...css.input, textAlign: 'right' }} className="enhanced-input" required value={formData.name.ar} onChange={(e) => setFormData({...formData, name: {...formData.name, ar: e.target.value}})} placeholder="مثال: رولز رويس فانتوم" />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ ...css.label, textAlign: 'right' }}>الماركة</label>
                  <input style={{ ...css.input, textAlign: 'right' }} className="enhanced-input" required value={formData.make.ar} onChange={(e) => setFormData({...formData, make: {...formData.make, ar: e.target.value}})} />
                </div>
                <div>
                  <label style={{ ...css.label, textAlign: 'right' }}>الموديل</label>
                  <input style={{ ...css.input, textAlign: 'right' }} className="enhanced-input" required value={formData.model.ar} onChange={(e) => setFormData({...formData, model: {...formData.model, ar: e.target.value}})} />
                </div>
              </div>

              <label style={{ ...css.label, textAlign: 'right' }}>الوصف</label>
              <textarea style={{ ...css.input, textAlign: 'right', height: '140px', resize: 'none', marginBottom: '10px' }} className="enhanced-input" value={formData.description.ar} onChange={(e) => setFormData({...formData, description: {...formData.description, ar: e.target.value}})} placeholder="موجز عن مميزات السيارة..." />
            </div>
          </div>

          {/* LOGISTICS & PRICING GRID */}
          <div style={{ marginTop: '20px', backgroundColor: '#f8fafc', padding: '30px', borderRadius: '12px', border: '2px solid #e2e8f0' }}>
            <p style={{ ...css.sectionLabel, border: 'none', marginBottom: '15px' }}><DollarSign size={14}/> Logistics & Pricing</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '25px' }}>
              <div>
                <label style={css.label}>Manufacture Year</label>
                <input type="number" style={{ ...css.input, marginBottom: 0 }} className="enhanced-input" required value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} placeholder="e.g. 2024" />
              </div>
              <div>
                <label style={css.label}>Price / Day (USD)</label>
                <input type="number" style={{ ...css.input, marginBottom: 0 }} className="enhanced-input" required value={formData.priceUsd} onChange={(e) => setFormData({...formData, priceUsd: e.target.value})} placeholder="150" />
              </div>
              <div>
                <label style={css.label}>Price / Day (EGP)</label>
                <input type="number" style={{ ...css.input, marginBottom: 0 }} className="enhanced-input" required value={formData.priceEgp} onChange={(e) => setFormData({...formData, priceEgp: e.target.value})} placeholder="7500" />
              </div>
            </div>
          </div>

          <button type="submit" style={{ width: '100%', backgroundColor: '#000000', color: '#ffffff', padding: '20px', borderRadius: '12px', fontWeight: '900', border: 'none', cursor: 'pointer', marginTop: '40px', fontSize: '16px', letterSpacing: '1px', textTransform: 'uppercase', transition: 'background-color 0.2s' }}>
            SUBMIT TO FLEET INVENTORY
          </button>
        </form>
      </div>

      <style jsx global>{`
        .upload-label {
          display: block;
          border: 3px dashed #2563eb;
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          cursor: pointer;
          background-color: #ffffff;
          transition: all 0.2s;
        }
        .upload-label:hover {
          border-color: #0f172a;
          background-color: #eff6ff;
        }
        .enhanced-input:focus {
          border-color: #000000 !important;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
          background-color: #f8fafc;
        }
      `}</style>
    </div>
  );
}