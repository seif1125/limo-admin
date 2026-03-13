"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api'; 
import { Trash2, Edit3, MessageSquare, User, Quote, Image as ImageIcon } from 'lucide-react';
import OverlayLoader from '@/components/loader';

export default function TestimonialsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/testimonials');
      setItems(res.data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    
    setActionLoading(true);
    setStatusMsg("Removing testimonial...");
    try {
      await api.delete(`/testimonials/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      alert("Delete failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const css = {
    page: { backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '20px', maxWidth: '100vw', overflowX: 'hidden' },
    container: { width: '100%', margin: '0 auto' },
    header: { 
      backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '2px solid #cbd5e1', 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'
    },
    scrollWrapper: { 
        width: '100%', overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '12px', border: '2px solid #cbd5e1', display: 'block'
    },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: '1800px', tableLayout: 'fixed' },
    th: { 
        backgroundColor: '#0f172a', color: '#ffffff', padding: '18px 15px', textAlign: 'left', 
        fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', whiteSpace: 'nowrap',
        borderRight: '1px solid #1e293b'
    },
    td: { 
        padding: '15px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', 
        color: '#000000', // Unified Black Color
        fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
    },
    imgContainer: { width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#f1f5f9', border: '2px solid #2563eb' }
  };

  if (loading) return <OverlayLoader message="Loading Testimonials..." />;

  return (
    <div style={css.page}>
      {actionLoading && <OverlayLoader message={statusMsg} />}

      <div style={css.container}>
        <div style={css.header}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare color="#2563eb" size={28} />
              <h1 style={{ fontWeight: '900', fontSize: '24px', margin: 0, color:'black'}}>TESTIMONIALS</h1>
            </div>
            <p style={{ margin: 0, color: '#000000', fontSize: '12px', fontWeight: 'bold' }}>Total Reviews: {items.length}</p>
          </div>
          
          <Link href="/dashboard/testimonials/add" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '900', fontSize: '12px' }}>
            + ADD TESTIMONIAL
          </Link>
        </div>

        <div style={css.scrollWrapper}>
          <table style={css.table}>
            <thead>
              <tr>
                <th style={{ ...css.th, width: '80px' }}>User</th>
                
                {/* ENGLISH GROUP */}
                <th style={{ ...css.th, width: '200px' }}>Name (EN)</th>
                <th style={{ ...css.th, width: '150px' }}>Title (EN)</th>
                <th style={{ ...css.th, width: '400px' }}>Feedback (EN)</th>

                {/* ARABIC GROUP */}
                <th style={{ ...css.th, width: '200px', textAlign: 'right' }}>الاسم (AR)</th>
                <th style={{ ...css.th, width: '150px', textAlign: 'right' }}>المسمى (AR)</th>
                <th style={{ ...css.th, width: '400px', textAlign: 'right' }}>الرأي (AR)</th>

                <th style={{ ...css.th, width: '120px', textAlign: 'center', borderRight: 'none' }}>Manage</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td style={css.td}>
                    <div style={css.imgContainer}>
                        {item.imageUrl ? (
                            <img src={item.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                              <User size={20} color="#000000" />
                            </div>
                        )}
                    </div>
                  </td>

                  {/* ENGLISH CONTENT */}
                  <td style={css.td}>{item.name?.en || 'Untitled'}</td>
                  <td style={{ ...css.td, color: '#000000' }}>{item.title?.en || 'Customer'}</td>
                  <td style={css.td} title={item.text?.en}>
                    
                    {item.text?.en || 'No content provided'}
                  </td>

                  {/* ARABIC CONTENT */}
                  <td style={{ ...css.td, textAlign: 'right', color: '#000000' }} dir="rtl">{item.name?.ar || '---'}</td>
                  <td style={{ ...css.td, textAlign: 'right', color: '#000000' }} dir="rtl">{item.title?.ar || '---'}</td>
                  <td style={{ ...css.td, textAlign: 'right', color: '#000000' }} dir="rtl" title={item.text?.ar}>
                    {item.text?.ar || 'لا يوجد نص'}
                  </td>

                  <td style={{ ...css.td, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <Link href={`/dashboard/testimonials/edit/${item._id}`} style={{ padding: '8px', backgroundColor: '#f1f5f9', color: '#000000', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        <Edit3 size={18} />
                      </Link>
                      <button onClick={() => handleDelete(item._id)} style={{ padding: '8px', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '6px', border: '1px solid #fecaca', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" style={{ ...css.td, textAlign: 'center', padding: '80px', color: '#000000' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <span style={{ letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '900' }}>No Testimonials Found</span>
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