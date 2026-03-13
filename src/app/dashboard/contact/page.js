"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Save, MapPin, Phone, Mail, Globe, Plus, Trash2, Facebook, Instagram } from 'lucide-react';
import OverlayLoader from '@/components/loader';

export default function ContactSettings() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [resetData, setResetData] = useState(null); // Stores the original data from DB
  const [formData, setFormData] = useState({
    phone: '', email: '', whatsapp: '', facebook: '', instagram: '',
    locations: []
  });

  useEffect(() => {
    api.get('/contact').then(res => {
      if(res.data) {
        setFormData(res.data);
        setResetData(JSON.stringify(res.data)); // Save baseline as string for easy comparison
      }
      setLoading(false);
    });
  }, []);

  // Check if current state differs from the baseline
  const isChanged = JSON.stringify(formData) !== resetData;

  const addLocation = () => {
    setFormData({
      ...formData,
      locations: [...formData.locations, { name: { en: '', ar: '' }, address: { en: '', ar: '' }, mapsUrl: '' }]
    });
  };

  const removeLocation = (index) => {
    const newLocs = formData.locations.filter((_, i) => i !== index);
    setFormData({ ...formData, locations: newLocs });
  };

  const handleLocationChange = (index, field, lang, value) => {
    const newLocs = [...formData.locations];
    // Deep clone the object to avoid reference issues
    const updatedLoc = { ...newLocs[index] };
    if (lang) {
        updatedLoc[field] = { ...updatedLoc[field], [lang]: value };
    } else {
        updatedLoc[field] = value;
    }
    newLocs[index] = updatedLoc;
    setFormData({ ...formData, locations: newLocs });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isChanged) return;

    setActionLoading(true);
    try {
      const res = await api.post('/contact', formData);
      setResetData(JSON.stringify(res.data)); // Update baseline after successful save
      alert("Contact settings updated successfully!");
    } catch (err) {
      alert("Failed to update.");
    } finally {
      setActionLoading(false);
    }
  };

  const css = {
    page: { backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '40px 20px' },
    card: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', border: '2px solid #cbd5e1', maxWidth: '1200px', margin: '0 auto' },
    sectionLabel: { color: '#2563eb', fontWeight: '900', fontSize: '11px', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', textTransform: 'uppercase' },
    label: { display: 'block', color: '#000', fontWeight: '900', fontSize: '12px', marginBottom: '8px' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #cbd5e1', color: '#000', fontWeight: '700', marginBottom: '15px', outline: 'none' },
    locationCard: { border: '2px solid #e2e8f0', padding: '20px', borderRadius: '12px', marginBottom: '20px', backgroundColor: '#f8fafc', position: 'relative' },
    saveBtn: { 
        backgroundColor: isChanged ? '#000' : '#cbd5e1', 
        color: isChanged ? '#fff' : '#94a3b8', 
        padding: '12px 30px', 
        borderRadius: '8px', 
        fontWeight: '900', 
        border: 'none', 
        cursor: isChanged ? 'pointer' : 'not-allowed', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        transition: 'all 0.3s ease'
    }
  };

  if (loading) return <OverlayLoader message="Fetching contact info..." />;

  return (
    <div style={css.page}>
      {actionLoading && <OverlayLoader message="Saving changes..." />}
      <form onSubmit={handleSubmit} style={css.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontWeight: '900', fontSize: '30px', color: '#000', margin: 0 }}>CONTACT & LOCATIONS</h1>
            {!isChanged && <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', marginTop: '5px' }}>NO CHANGES DETECTED</p>}
          </div>
          <button 
            type="submit" 
            disabled={!isChanged} 
            style={css.saveBtn}
          >
            <Save size={18} /> SAVE SETTINGS
          </button>
        </div>

        {/* PRIMARY CONTACTS */}
        <div style={css.sectionLabel}>Primary Channels</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <label style={css.label}><Phone size={14} style={{marginRight: '8px', verticalAlign:'middle'}} /> Phone Number</label>
            <input style={css.input} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div>
            <label style={css.label}><Mail size={14} style={{marginRight: '8px', verticalAlign:'middle'}} /> Business Email</label>
            <input style={css.input} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label style={css.label}><Globe size={14} style={{marginRight: '8px', verticalAlign:'middle'}} /> WhatsApp</label>
            <input style={css.input} value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
          </div>
          <div>
            <label style={css.label}><Facebook size={14} style={{marginRight: '8px', verticalAlign:'middle'}} /> Facebook URL</label>
            <input style={css.input} value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} />
          </div>
          <div>
            <label style={css.label}><Instagram size={14} style={{marginRight: '8px', verticalAlign:'middle'}} /> Instagram URL</label>
            <input style={css.input} value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} />
          </div>
        </div>

        {/* BRANCH LOCATIONS */}
        <div style={{ ...css.sectionLabel, marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Branch Locations
          <button type="button" onClick={addLocation} style={{ backgroundColor: '#2563eb', color: '#fff', padding: '5px 15px', borderRadius: '6px', fontSize: '10px', border: 'none', cursor: 'pointer' }}>
            + ADD BRANCH
          </button>
        </div>

        {formData.locations.map((loc, index) => (
          <div key={index} style={css.locationCard}>
            <button type="button" onClick={() => removeLocation(index)} style={{ position: 'absolute', top: '15px', right: '15px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Trash2 size={20} />
            </button>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div>
                <label style={css.label}>Branch Name (EN)</label>
                <input style={css.input} value={loc.name.en} onChange={e => handleLocationChange(index, 'name', 'en', e.target.value)} />
                <label style={css.label}>Full Address (EN)</label>
                <input style={css.input} value={loc.address.en} onChange={e => handleLocationChange(index, 'address', 'en', e.target.value)} />
              </div>
              <div dir="rtl">
                <label style={{ ...css.label, textAlign: 'right' }}>اسم الفرع (AR)</label>
                <input style={{ ...css.input, textAlign: 'right' }} value={loc.name.ar} onChange={e => handleLocationChange(index, 'name', 'ar', e.target.value)} />
                <label style={{ ...css.label, textAlign: 'right' }}>العنوان بالكامل (AR)</label>
                <input style={{ ...css.input, textAlign: 'right' }} value={loc.address.ar} onChange={e => handleLocationChange(index, 'address', 'ar', e.target.value)} />
              </div>
            </div>
            <label style={css.label}><MapPin size={14} style={{marginRight: '8px', verticalAlign:'middle'}} /> Google Maps URL</label>
            <input style={{ ...css.input, marginBottom: 0 }} placeholder="https://maps.google.com/..." value={loc.mapsUrl} onChange={e => handleLocationChange(index, 'mapsUrl', null, e.target.value)} />
          </div>
        ))}
      </form>
    </div>
  );
}