"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api'; 
import { Trash2, Edit3, Plus, Car, Image as ImageIcon } from 'lucide-react';
import OverlayLoader from '@/components/loader';

export default function GetCarsPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => { loadCars(); }, []);

  const loadCars = async () => {
    try {
      const res = await api.get('/cars');
      setCars(res.data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    
    setActionLoading(true);
    setStatusMsg("Deleting car and assets...");
    try {
      await api.delete(`/cars/${id}`);
      setCars(prev => prev.filter(c => c._id !== id));
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
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: '2100px', tableLayout: 'fixed' },
    th: { 
        backgroundColor: '#0f172a', // Unified Color
        color: '#ffffff', 
        padding: '18px 15px', 
        textAlign: 'left', 
        fontSize: '11px', 
        fontWeight: '900', 
        textTransform: 'uppercase', 
        whiteSpace: 'nowrap',
        borderRight: '1px solid #1e293b'
    },
    td: { 
        padding: '15px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', 
        color: '#000000', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
    },
    priceTag: { padding: '4px 10px', borderRadius: '6px', fontSize: '12px', border: '1px solid' },
    imgContainer: { width: '90px', height: '60px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1' }
  };

  if (loading) return <OverlayLoader message="Loading Fleet..." />;

  return (
    <div style={css.page}>
      {actionLoading && <OverlayLoader message={statusMsg} />}

      <div style={css.container}>
        <div style={css.header}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Car color="#000" size={28} />
              <h1 style={{ fontWeight: '900', fontSize: '24px', margin: 0, color:'black'}}>FLEET INVENTORY</h1>
            </div>
            <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>Active Listings: {cars.length}</p>
          </div>
          
          <Link href="/dashboard/fleet/add" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '900', fontSize: '12px' }}>
            + ADD NEW VEHICLE
          </Link>
        </div>

        <div style={css.scrollWrapper}>
          <table style={css.table}>
            <thead>
              <tr>
                <th style={{ ...css.th, width: '120px' }}>Main Photo</th>
                <th style={{ ...css.th, width: '100px' }}>Year</th>
                <th style={{ ...css.th, width: '140px' }}>Daily (USD)</th>
                <th style={{ ...css.th, width: '140px' }}>Daily (EGP)</th>
                
                {/* ENGLISH GROUP */}
                <th style={{ ...css.th, width: '220px' }}>Name (EN)</th>
                <th style={{ ...css.th, width: '180px' }}>Make/Model (EN)</th>
                <th style={{ ...css.th, width: '300px' }}>Description (EN)</th>

                {/* ARABIC GROUP */}
                <th style={{ ...css.th, width: '220px', textAlign: 'right' }}>اسم السيارة (AR)</th>
                <th style={{ ...css.th, width: '180px', textAlign: 'right' }}>الماركة والموديل (AR)</th>
                <th style={{ ...css.th, width: '300px', textAlign: 'right' }}>وصف السيارة (AR)</th>

                <th style={{ ...css.th, width: '120px', textAlign: 'center', borderRight: 'none' }}>Manage</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car._id}>
                  <td style={css.td}>
                    <div style={css.imgContainer}>
                        {car.images?.[0] ? (
                            <img src={car.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                              <ImageIcon size={20} color="#cbd5e1" />
                            </div>
                        )}
                    </div>
                  </td>

                  <td style={css.td}>{car.year || '---'}</td>

                  <td style={css.td}>
                    <span style={{ ...css.priceTag, color: '#166534', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                        ${car.priceUsd || 0}
                    </span>
                  </td>
                  <td style={css.td}>
                    <span style={{ ...css.priceTag, color: '#1e40af', backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                        {car.priceEgp || 0} EGP
                    </span>
                  </td>

                  {/* ENGLISH CONTENT */}
                  <td style={css.td} title={car.name?.en}>{car.name?.en || 'Untitled'}</td>
                  <td style={css.td}>{car.make?.en || 'N/A'} {car.model?.en || ''}</td>
                  <td style={css.td} title={car.description?.en}>{car.description?.en || 'No English Description'}</td>

                  {/* ARABIC CONTENT */}
                  <td style={{ ...css.td, textAlign: 'right' }} dir="rtl">{car.name?.ar || '---'}</td>
                  <td style={{ ...css.td, textAlign: 'right' }} dir="rtl">{car.make?.ar || ''} {car.model?.ar || ''}</td>
                  <td style={{ ...css.td, textAlign: 'right' }} dir="rtl" title={car.description?.ar}>
                    {car.description?.ar || 'لا يوجد وصف'}
                  </td>

                  <td style={{ ...css.td, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <Link href={`/dashboard/fleet/edit/${car._id}`} style={{ padding: '8px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        <Edit3 size={18} />
                      </Link>
                      <button onClick={() => handleDelete(car._id)} style={{ padding: '8px', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '6px', border: '1px solid #fecaca', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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