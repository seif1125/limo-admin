"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Clock, CheckCircle, User, Car, Calendar, Trash2, Globe, Phone, Activity, Settings, ChevronDown, Plus, Search } from 'lucide-react';
import OverlayLoader from '@/components/loader';

export default function DashboardPage() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ pending: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  // Multi-field search logic
  useEffect(() => {
    const results = requests.filter(req => 
      req.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.phone1?.includes(searchTerm) ||
      req.car?.name?.en?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRequests(results);
  }, [searchTerm, requests]);

  const loadData = async () => {
    try {
      const res = await api.get('/rentals'); 
      setRequests(res.data);
      const pending = res.data.filter(r => r.status === 'pending').length;
      const active = res.data.filter(r => r.status === 'active').length;
      setStats({ pending, active });
    } catch (err) {
      console.error("Load failed", err);
    } finally { setLoading(false); }
  };

  const updateStatus = async (id, newStatus) => {
    setActionLoading(true);
    try {
      await api.put(`/reservations/status/${id}`, { status: newStatus });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Status update failed");
    } finally { setActionLoading(false); }
  };

  const deleteRes = async (id) => {
    if (!window.confirm("Delete this reservation permanently?")) return;
    setActionLoading(true);
    try {
      await api.delete(`/reservations/${id}`);
      await loadData();
    } catch (err) {
      alert("Delete failed");
    } finally { setActionLoading(false); }
  };

  const css = {
    page: { backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '20px' },
    container: { width: '100%', margin: '0 auto' },
    header: { backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '2px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    controlsRow: { display: 'flex', gap: '15px', marginBottom: '25px', alignItems: 'center' },
    searchWrapper: { position: 'relative', flex: 1 },
    searchInput: { width: '100%', padding: '12px 15px 12px 40px', borderRadius: '10px', border: '2px solid #cbd5e1', outline: 'none', fontSize: '14px', fontWeight: '600' },
    addButton: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#000', color: '#fff', padding: '12px 20px', borderRadius: '10px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', border: 'none' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '25px' },
    statCard: { backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '2px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '15px' },
    scrollWrapper: { width: '100%', overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '12px', border: '2px solid #cbd5e1' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: '1500px', tableLayout: 'fixed' },
    th: { backgroundColor: '#0f172a', color: '#ffffff', padding: '15px', textAlign: 'left', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', borderRight: '1px solid #1e293b' },
    thContent: { display: 'flex', alignItems: 'center', gap: '8px' },
    td: { padding: '12px 15px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', color: '#000', fontWeight: '700', whiteSpace: 'nowrap' },
    statusSelect: (status) => ({
      padding: '6px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '900',
      backgroundColor: status === 'active' ? '#f0fdf4' : '#fffbeb',
      color: status === 'active' ? '#166534' : '#92400e',
      border: `1px solid ${status === 'active' ? '#bbf7d0' : '#fef3c7'}`,
      cursor: 'pointer', outline: 'none', appearance: 'none', width: '100%', textAlign: 'center'
    })
  };

  if (loading) return <OverlayLoader message="Syncing Dashboard..." />;

  return (
    <div style={css.page}>
      {actionLoading && <OverlayLoader message="Updating..." />}
      
      <div style={css.container}>
        {/* Top Header */}
        <div style={css.header}>
          <div>
            <h1 style={{ fontWeight: '900', fontSize: '24px', margin: 0, color:'black'}}>RESERVATIONS HUB</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>Live fleet management & bookings</p>
          </div>
          <button style={css.addButton} onClick={() => alert("Open Add Modal")}>
            <Plus size={18} /> NEW RESERVATION
          </button>
        </div>

        {/* Search & Stats Row */}
        <div style={css.controlsRow}>
          <div style={css.searchWrapper}>
            <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Search by name, email, phone or car..." 
              style={css.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ ...css.statCard, padding: '10px 20px', minWidth: '180px' }}>
            <Clock size={18} color="#92400e" />
            <span style={{ fontSize: '12px', fontWeight: '800' }}>{stats.pending} PENDING</span>
          </div>
          <div style={{ ...css.statCard, padding: '10px 20px', minWidth: '180px' }}>
            <CheckCircle size={18} color="#166534" />
            <span style={{ fontSize: '12px', fontWeight: '800' }}>{stats.active} ACTIVE</span>
          </div>
        </div>

        <div style={css.scrollWrapper}>
          <table style={css.table}>
            <thead>
              <tr>
                <th style={{ ...css.th, width: '280px' }}><div style={css.thContent}><User size={14} /> Customer</div></th>
                <th style={{ ...css.th, width: '300px' }}><div style={css.thContent}><Phone size={14} /> Contact</div></th>
                <th style={{ ...css.th, width: '140px' }}><div style={css.thContent}><Globe size={14} /> Nationality</div></th>
                <th style={{ ...css.th, width: '200px' }}><div style={css.thContent}><Car size={14} /> Vehicle</div></th>
                <th style={{ ...css.th, width: '250px' }}><div style={css.thContent}><Calendar size={14} /> Period</div></th>
                <th style={{ ...css.th, width: '140px' }}><div style={css.thContent}><Activity size={14} /> Status</div></th>
                <th style={{ ...css.th, width: '80px', borderRight: 'none', textAlign: 'center' }}>
                   <div style={{...css.thContent, justifyContent:'center'}}><Settings size={14} /></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req._id}>
                  <td style={css.td}>{req.customerName} <span style={{fontSize:'11px', color:'#64748b'}}>({req.email})</span></td>
                  <td style={css.td}>{req.phone1} {req.phone2 && <span style={{color:'#cbd5e1'}}> | {req.phone2}</span>}</td>
                  <td style={css.td}>{req.nationality}</td>
                  <td style={css.td}>{req.car?.name?.en || 'N/A'}</td>
                  <td style={css.td}>
                    {new Date(req.fromDate).toLocaleDateString()} <span style={{color: '#94a3b8'}}>→</span> {new Date(req.toDate).toLocaleDateString()}
                  </td>
                  <td style={css.td}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <select 
                        value={req.status} 
                        onChange={(e) => updateStatus(req._id, e.target.value)}
                        style={css.statusSelect(req.status)}
                      >
                        <option value="pending">PENDING</option>
                        <option value="active">ACTIVE</option>
                      </select>
                      <ChevronDown size={12} style={{ position: 'absolute', right: '8px', pointerEvents: 'none' }} />
                    </div>
                  </td>
                  <td style={{ ...css.td, textAlign: 'center' }}>
                    <button onClick={() => deleteRes(req._id)} style={{ color: '#ef4444', cursor: 'pointer', background:'none', border:'none' }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRequests.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', fontWeight: 'bold', color: '#64748b' }}>
              No reservations found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}