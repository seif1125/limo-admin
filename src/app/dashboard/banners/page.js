"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api'; 
import { Trash2, Plus, Layout, ExternalLink, ImageIcon } from 'lucide-react';
import OverlayLoader from '@/components/loader';

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => { loadBanners(); }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      setStatusMessage("Fetching Data...");
      const res = await api.get('/banners');
      setBanners(res.data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    setLoading(true);
    setStatusMessage("Deleting Image & Data...");
    
    try {
      await api.delete(`/banners/${id}`);
      setBanners(prev => prev.filter(b => b._id !== id));
    } finally {
      setLoading(false);
    }
  };

  const css = {
    page: { 
        backgroundColor: '#f1f5f9', 
        minHeight: '100vh', 
        padding: '20px',
        maxWidth: '100vw', 
        overflowX: 'hidden', 
        boxSizing: 'border-box'
    },
    container: { width: '100%', margin: '0 auto' },
    header: { 
      backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '2px solid #cbd5e1', 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'
    },
    scrollWrapper: { 
        width: '100%', 
        overflowX: 'auto', 
        backgroundColor: '#ffffff', 
        borderRadius: '12px', 
        border: '2px solid #cbd5e1',
        display: 'block'
    },
    table: { 
        width: '100%', 
        borderCollapse: 'separate', 
        borderSpacing: 0,
        minWidth: '1600px', 
        tableLayout: 'fixed' 
    },
    th: { 
        backgroundColor: '#0f172a', color: '#ffffff', padding: '18px 15px', textAlign: 'left', 
        fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', whiteSpace: 'nowrap',
        borderRight: '1px solid #1e293b'
    },
    td: { 
        padding: '15px', 
        borderBottom: '1px solid #e2e8f0', 
        fontSize: '14px', 
        color: '#000000', 
        fontWeight: '700', 
        whiteSpace: 'nowrap',
        overflow: 'hidden', 
        textOverflow: 'ellipsis'
    },
    buttonLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        color: '#2563eb',
        textDecoration: 'none',
        backgroundColor: '#eff6ff',
        padding: '6px 12px',
        borderRadius: '6px',
        border: '1px solid #bfdbfe',
        fontSize: '12px',
        fontWeight: '900'
    },
    img: { width: '100px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }
  };

  return (
    <div style={css.page}>
      {loading && <OverlayLoader message={statusMessage} />}
      <div style={css.container}>
        
        <div style={css.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <ImageIcon color="#2563eb" size={28} /> 
            <h1 style={{ color: '#000', fontWeight: '900', margin: 0, fontSize: '24px', letterSpacing: '-0.5px' }}>
                BANNER INVENTORY
            </h1>
          </div>
       
          {banners.length < 2 && (
            <Link href="/dashboard/banners/add" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '900', fontSize: '12px' }}>
                + NEW BANNER
            </Link>
          )}
        </div>

        <div style={css.scrollWrapper}>
          <table style={css.table}>
            <thead>
              <tr>
                <th style={{ ...css.th, width: '130px' }}>Preview</th>
                <th style={{ ...css.th, width: '250px' }}>Title (EN)</th>
                <th style={{ ...css.th, width: '250px' }}>Subtitle (EN)</th>
                <th style={{ ...css.th, width: '180px' }}>Button (EN)</th>
                <th style={{ ...css.th, width: '250px', textAlign: 'right' }}>العنوان (AR)</th>
                <th style={{ ...css.th, width: '250px', textAlign: 'right' }}>الفرعي (AR)</th>
                <th style={{ ...css.th, width: '180px', textAlign: 'right' }}>الزر (AR)</th>
                <th style={{ ...css.th, width: '100px', textAlign: 'center', borderRight: 'none' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {banners.length > 0 ? (
                banners.map((b) => (
                  <tr key={b._id}>
                    <td style={css.td}><img src={b.imageUrl} alt="banner" style={css.img} /></td>
                    
                    {/* English Section */}
                    <td style={css.td} title={b.title?.en}>{b.title?.en || '---'}</td>
                    <td style={css.td} title={b.subtitle?.en}>{b.subtitle?.en || '---'}</td>
                    <td style={css.td}>
                      {b.button1?.link ? (
                          <a href={b.button1.link} target="_blank" rel="noopener noreferrer" style={css.buttonLink}>
                              <ExternalLink size={12} /> {b.button1?.text?.en || 'View Link'}
                          </a>
                      ) : (
                          <span style={{ color: '#94a3b8' }}>No Link</span>
                      )}
                    </td>
                    
                    {/* Arabic Section */}
                    <td style={{ ...css.td, textAlign: 'right' }} dir="rtl" title={b.title?.ar}>{b.title?.ar || '---'}</td>
                    <td style={{ ...css.td, textAlign: 'right' }} dir="rtl" title={b.subtitle?.ar}>{b.subtitle?.ar || '---'}</td>
                    <td style={{ ...css.td, textAlign: 'right' }} dir="rtl">
                      {b.button1?.link ? (
                          <a href={b.button1.link} target="_blank" rel="noopener noreferrer" style={{ ...css.buttonLink, flexDirection: 'row-reverse' }}>
                              <ExternalLink size={12} /> {b.button1?.text?.ar || 'رابط'}
                          </a>
                      ) : (
                          <span style={{ color: '#94a3b8' }}>لا يوجد رابط</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ ...css.td, textAlign: 'center' }}>
                      <button onClick={() => handleDelete(b._id)} style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                // EMPTY STATE ROW
                <tr>
                  <td colSpan="8" style={{ ...css.td, textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>

                        <span style={{ letterSpacing: '1px', textTransform: 'uppercase' }}>No Banners Found in Inventory</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar { height: 10px; }
        div::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}