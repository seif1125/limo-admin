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

  const css = {
    page: { backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '40px 20px' },
    card: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', border: '2px solid #cbd5e1', maxWidth: '1100px', margin: '0 auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
    sectionLabel: { color: '#2563eb', fontWeight: '900', fontSize: '11px', marginBottom: '25px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' },
    label: { display: 'block', color: '#000000', fontWeight: '800', fontSize: '13px', marginBottom: '8px' },
    input: { width: '100%', padding: '14px', borderRadius: '8px', border: '2px solid #cbd5e1', fontSize: '15px', marginBottom: '20px', outline: 'none', color: '#000000', fontWeight: '600' },
  };

  if (loading) return <OverlayLoader message="Fetching Details..." />;

  return (
    <div style={css.page}>
      {actionLoading && <OverlayLoader message={statusMsg} />}
      
      <div style={css.card}>
        <Link href="/dashboard/fleet" style={{ color: '#64748b', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '25px', textDecoration: 'none', fontSize: '13px' }}>
          <ArrowLeft size={16} /> CANCEL CHANGES
        </Link>

        <h1 style={{ fontWeight: '900', fontSize: '32px', color: '#0f172a', marginBottom: '40px', letterSpacing: '-1.5px' }}>
          EDIT VEHICLE: <span style={{ color: '#2563eb' }}>{formData.name.en}</span>
        </h1>

        <form onSubmit={handleSubmit}>
          {/* ENHANCED IMAGE SECTION */}
          <div style={css.sectionLabel}><Upload size={14}/> Media Library ({images.length}/3)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            {images.map((url, i) => (
              <div key={i} style={{ position: 'relative', width: '160px', height: '100px', border: '3px solid #2563eb', borderRadius: '10px', overflow: 'hidden' }}>
                <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: '5px', right: '5px', backgroundColor: '#ef4444', color: '#fff', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: '5px' }}>
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            ))}
            {images.length < 3 && (
              <label className="upload-btn">
                <Upload size={24} color="#2563eb" />
                <span style={{ fontSize: '11px', fontWeight: '900', marginTop: '5px', color: '#000' }}>ADD MEDIA</span>
                <input type="file" multiple onChange={handleUpload} style={{ display: 'none' }} accept="image/*" />
              </label>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            {/* ENGLISH SECTION */}
            <div>
              <p style={css.sectionLabel}>English Specification</p>
              <label style={css.label}>Display Name</label>
              <input style={css.input} className="black-input" required value={formData.name.en} onChange={(e) => setFormData({...formData, name: {...formData.name, en: e.target.value}})} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={css.label}>Make</label>
                  <input style={css.input} className="black-input" required value={formData.make.en} onChange={(e) => setFormData({...formData, make: {...formData.make, en: e.target.value}})} />
                </div>
                <div>
                  <label style={css.label}>Model</label>
                  <input style={css.input} className="black-input" required value={formData.model.en} onChange={(e) => setFormData({...formData, model: {...formData.model, en: e.target.value}})} />
                </div>
              </div>

              <label style={css.label}>Description</label>
              <textarea style={{ ...css.input, height: '140px', resize: 'none' }} className="black-input" value={formData.description.en} onChange={(e) => setFormData({...formData, description: {...formData.description, en: e.target.value}})} />
            </div>

            {/* ARABIC SECTION */}
            <div dir="rtl">
              <p style={{ ...css.sectionLabel, flexDirection: 'row-reverse' }}>التفاصيل العربية</p>
              <label style={{ ...css.label, textAlign: 'right' }}>اسم العرض</label>
              <input style={{ ...css.input, textAlign: 'right' }} className="black-input" required value={formData.name.ar} onChange={(e) => setFormData({...formData, name: {...formData.name, ar: e.target.value}})} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ ...css.label, textAlign: 'right' }}>الماركة</label>
                  <input style={{ ...css.input, textAlign: 'right' }} className="black-input" required value={formData.make.ar} onChange={(e) => setFormData({...formData, make: {...formData.make, ar: e.target.value}})} />
                </div>
                <div>
                  <label style={{ ...css.label, textAlign: 'right' }}>الموديل</label>
                  <input style={{ ...css.input, textAlign: 'right' }} className="black-input" required value={formData.model.ar} onChange={(e) => setFormData({...formData, model: {...formData.model, ar: e.target.value}})} />
                </div>
              </div>

              <label style={{ ...css.label, textAlign: 'right' }}>الوصف</label>
              <textarea style={{ ...css.input, textAlign: 'right', height: '140px', resize: 'none' }} className="black-input" value={formData.description.ar} onChange={(e) => setFormData({...formData, description: {...formData.description, ar: e.target.value}})} />
            </div>
          </div>

          <div style={{ marginTop: '20px', backgroundColor: '#f8fafc', padding: '30px', borderRadius: '12px', border: '2px solid #e2e8f0' }}>
            <p style={{ ...css.sectionLabel, border: 'none', marginBottom: '15px' }}><DollarSign size={14}/> Logistics & Pricing</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '25px' }}>
              <div>
                <label style={css.label}>Manufacture Year</label>
                <input type="number" style={{ ...css.input, marginBottom: 0 }} className="black-input" required value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} />
              </div>
              <div>
                <label style={css.label}>Price / Day (USD)</label>
                <input type="number" style={{ ...css.input, marginBottom: 0 }} className="black-input" required value={formData.priceUsd} onChange={(e) => setFormData({...formData, priceUsd: e.target.value})} />
              </div>
              <div>
                <label style={css.label}>Price / Day (EGP)</label>
                <input type="number" style={{ ...css.input, marginBottom: 0 }} className="black-input" required value={formData.priceEgp} onChange={(e) => setFormData({...formData, priceEgp: e.target.value})} />
              </div>
            </div>
          </div>

          <button type="submit" style={{ width: '100%', backgroundColor: '#000', color: '#fff', padding: '20px', borderRadius: '12px', fontWeight: '900', border: 'none', cursor: 'pointer', marginTop: '40px', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            <Save size={20} /> PUSH UPDATES TO FLEET
          </button>
        </form>
      </div>

      <style jsx global>{`
        .upload-btn {
          width: 160px; 
          height: 100px; 
          border: 3px dashed #2563eb; 
          border-radius: 10px; 
          display: flex; 
          flex-direction: column; 
          justify-content: center; 
          align-items: center; 
          cursor: pointer; 
          background-color: #fff;
          transition: all 0.2s;
        }
        .upload-btn:hover {
          background-color: #eff6ff;
          border-color: #0f172a;
        }
        .black-input:focus {
          border-color: #000 !important;
          background-color: #f8fafc;
        }
      `}</style>
    </div>
  );
}