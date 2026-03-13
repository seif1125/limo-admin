"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api'; 
import { Trash2, Edit3, Car, Image as ImageIcon } from 'lucide-react';
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

  if (loading) return <OverlayLoader message="Loading Fleet..." />;

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:p-6 w-full overflow-x-hidden box-border">
      {actionLoading && <OverlayLoader message={statusMsg} />}

      <div className="max-w-full mx-auto">
        
        {/* Responsive Header */}
        <div className="bg-white p-5 md:p-6 rounded-xl border-2 border-slate-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <Car className="text-slate-900" size={28} />
              <h1 className="font-black  text-slate-900 text-xl md:text-2xl m-0 text-slate-900 tracking-tighter uppercase">
                Fleet Inventory
              </h1>
            </div>
            <p className="m-0 mt-1 text-slate-500 text-xs font-bold tracking-wider">
              ACTIVE LISTINGS: {cars.length}
            </p>
          </div>
          
          <Link 
            href="/dashboard/fleet/add" 
            className="w-full md:w-auto text-center bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-lg no-underline font-black text-xs transition-colors"
          >
            + ADD NEW VEHICLE
          </Link>
        </div>

        {/* Scrollable Table Wrapper */}
        <div className="bg-white rounded-xl border-2 border-slate-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse min-w-[1800px]">
              <thead>
                <tr className="bg-slate-900">
                  <th className="p-4 text-left text-[11px] font-black text-white uppercase border-r border-slate-800 w-[120px]">Main Photo</th>
                  <th className="p-4 text-left text-[11px] font-black text-white uppercase border-r border-slate-800 w-[100px]">Year</th>
                  <th className="p-4 text-left text-[11px] font-black text-white uppercase border-r border-slate-800 w-[140px]">Daily (USD)</th>
                  <th className="p-4 text-left text-[11px] font-black text-white uppercase border-r border-slate-800 w-[140px]">Daily (EGP)</th>
                  
                  {/* ENGLISH GROUP */}
                  <th className="p-4 text-left text-[11px] font-black text-white uppercase border-r border-slate-800 w-[200px]">Name (EN)</th>
                  <th className="p-4 text-left text-[11px] font-black text-white uppercase border-r border-slate-800 w-[180px]">Make/Model (EN)</th>
                  <th className="p-4 text-left text-[11px] font-black text-white uppercase border-r border-slate-800 w-[250px]">Description (EN)</th>

                  {/* ARABIC GROUP */}
                  <th className="p-4 text-right text-[11px] font-black text-white uppercase border-r border-slate-800 w-[200px]">اسم السيارة (AR)</th>
                  <th className="p-4 text-right text-[11px] font-black text-white uppercase border-r border-slate-800 w-[180px]">الماركة والموديل (AR)</th>
                  <th className="p-4 text-right text-[11px] font-black text-white uppercase border-r border-slate-800 w-[250px]">وصف السيارة (AR)</th>

                  <th className="p-4 text-center text-[11px] font-black text-white uppercase w-[120px]">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {cars.length > 0 ? (
                  cars.map((car) => (
                    <tr key={car._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="w-[90px] h-[60px] rounded-md overflow-hidden bg-slate-100 border border-slate-300 flex items-center justify-center">
                            {car.images?.[0] ? (
                                <img src={car.images[0]} className="w-full h-full object-cover" alt="Car preview" />
                            ) : (
                                <ImageIcon size={20} className="text-slate-300" />
                            )}
                        </div>
                      </td>

                      <td className="p-4 text-sm font-bold text-slate-900">{car.year || '---'}</td>

                      <td className="p-4">
                        <span className="px-3 py-1 rounded-md text-xs font-bold border border-green-200 text-green-800 bg-green-50">
                            ${car.priceUsd || 0}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-md text-xs font-bold border border-blue-200 text-blue-800 bg-blue-50">
                            {car.priceEgp || 0} EGP
                        </span>
                      </td>

                      {/* ENGLISH CONTENT */}
                      <td className="p-4 text-sm font-bold text-slate-900 truncate max-w-[200px]" title={car.name?.en}>{car.name?.en || 'Untitled'}</td>
                      <td className="p-4 text-sm font-bold text-slate-900 truncate max-w-[180px]">{car.make?.en || 'N/A'} {car.model?.en || ''}</td>
                      <td className="p-4 text-sm font-medium text-slate-600 truncate max-w-[250px]" title={car.description?.en}>{car.description?.en || 'No English Description'}</td>

                      {/* ARABIC CONTENT */}
                      <td className="p-4 text-sm font-bold text-slate-900 text-right truncate max-w-[200px]" dir="rtl" title={car.name?.ar}>{car.name?.ar || '---'}</td>
                      <td className="p-4 text-sm font-bold text-slate-900 text-right truncate max-w-[180px]" dir="rtl">{car.make?.ar || ''} {car.model?.ar || ''}</td>
                      <td className="p-4 text-sm font-medium text-slate-600 text-right truncate max-w-[250px]" dir="rtl" title={car.description?.ar}>
                        {car.description?.ar || 'لا يوجد وصف'}
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Link href={`/dashboard/fleet/edit/${car._id}`} className="p-2 bg-slate-100 text-slate-600 rounded-md border border-slate-300 hover:bg-blue-50 hover:text-slate-900 hover:border-blue-300 transition-colors">
                            <Edit3 size={18} />
                          </Link>
                          <button onClick={() => handleDelete(car._id)} className="p-2 bg-red-50 text-red-500 rounded-md border border-red-200 hover:bg-red-500 hover:text-white transition-colors cursor-pointer">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="p-16 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">
                      No Vehicles Found in Fleet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { height: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; border: 2px solid #ffffff; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
      `}</style>
    </div>
  );
}