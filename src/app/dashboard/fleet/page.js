"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api'; 
import { 
  Trash2, Edit3, Car, Image as ImageIcon, Tag, Clock, 
  Users, Briefcase, Wifi, ShieldCheck, MapPin, Wind, Zap 
} from 'lucide-react';
import OverlayLoader from '@/components/loader';

export default function GetCarsPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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
    if (!window.confirm("Delete this vehicle? This action is permanent.")) return;
    setActionLoading(true);
    try {
      await api.delete(`/cars/${id}`);
      setCars(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert("Delete failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const specIconClass = "flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-bold";

  if (loading) return <OverlayLoader message="Loading Fleet..." />;

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:p-6 w-full overflow-x-hidden">
      {actionLoading && <OverlayLoader message="Removing vehicle..." />}

      <div className="max-w-full mx-auto">
        {/* HEADER */}
        <div className="bg-white p-6 rounded-xl border-2 border-slate-300 flex flex-col md:flex-row justify-between items-center gap-4 mb-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Car className="text-slate-900" size={28} />
            <h1 className="font-black text-slate-900 text-2xl tracking-tighter uppercase">Fleet Inventory</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/categories" className="bg-white border-2 border-slate-300 hover:bg-slate-50 text-slate-900 px-4 py-3 rounded-lg font-black text-xs transition-colors uppercase">
              Manage Categories
            </Link>
            <Link href="/dashboard/fleet/add" className="bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-black text-xs transition-colors uppercase shadow-lg">
              + Add Vehicle
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-slate-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest">
                  <th className="p-4 text-left w-[80px]">Photo</th>
                  <th className="p-4 text-left">Vehicle Info</th>
                  <th className="p-4 text-left">Specifications</th>
                  <th className="p-4 text-left">Rental Types</th>
                  <th className="p-4 text-left">Full Day Limits</th>
                  <th className="p-4 text-left">Pricing</th>
                  <th className="p-4 text-center w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {cars.map((car) => (
                  <tr key={car._id} className="hover:bg-blue-50/30 transition-colors">
                    {/* PHOTO */}
                    <td className="p-4">
                      <div className="w-16 h-12 rounded bg-slate-100 border border-slate-200 overflow-hidden shadow-inner">
                        {car.images?.[0] ? <img src={car.images[0]} className="w-full h-full object-cover" /> : <ImageIcon className="m-auto text-slate-300" />}
                      </div>
                    </td>
                    
                    {/* INFO */}
                    <td className="p-4">
                        <div className="font-black text-slate-900 text-sm uppercase leading-none mb-1">{car.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{car.model} • {car.year}</div>
                        <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[9px] font-black uppercase">
                            {car.category?.name || 'General'}
                        </span>
                    </td>

                    {/* SPECS */}
                    <td className="p-4">
                        <div className="grid grid-cols-2 gap-1.5 w-max">
                            <span className={specIconClass}><Users size={10}/> {car.specs?.passengers || 4}</span>
                            <span className={specIconClass}><Briefcase size={10}/> {car.specs?.luggage || 2}</span>
                            {car.specs?.wifi && <span className={specIconClass}><Wifi size={10}/> WiFi</span>}
                            {car.specs?.gps && <span className={specIconClass}><MapPin size={10}/> GPS</span>}
                            {car.specs?.fourWheel && <span className={specIconClass}><Zap size={10}/> 4WD</span>}
                            {car.specs?.climateControl && <span className={specIconClass}><Wind size={10}/> A/C</span>}
                        </div>
                    </td>

                    {/* RENTAL TYPES */}
                    <td className="p-4">
                        <div className="flex flex-col gap-1">
                            {car.rentalOptions?.isStandardRental && (
                                <span className="flex items-center gap-1 text-[9px] font-black text-slate-500 uppercase">
                                    <ShieldCheck size={12} className="text-green-500"/> Standard
                                </span>
                            )}
                            {car.rentalOptions?.isFullDayRental && (
                                <span className="flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase">
                                    <Clock size={12}/> Full Day
                                </span>
                            )}
                        </div>
                    </td>

                    {/* FULL DAY LIMITS */}
                    <td className="p-4">
                        {car.rentalOptions?.isFullDayRental ? (
                            <div className="space-y-1">
                                <div className="text-[10px] font-bold text-slate-700 uppercase">
                                    <span className="text-slate-400">Limit:</span> {car.rentalOptions.fullDayHours}h / {car.rentalOptions.limitKilometers}km
                                </div>
                                <div className="text-[9px] font-bold text-blue-500 uppercase">
                                    +${car.rentalOptions.extraHourCost}/hr • +${car.rentalOptions.extraKmCost}/km
                                </div>
                            </div>
                        ) : (
                            <span className="text-[10px] font-bold text-slate-300 uppercase italic">N/A</span>
                        )}
                    </td>

                    {/* PRICING */}
                    <td className="p-4">
                        <div className="text-sm font-black text-slate-900">${car.price}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Per Day Base</div>
                    </td>

                    {/* ACTIONS */}
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Link href={`/dashboard/fleet/edit/${car._id}`} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-900 hover:text-white transition-all">
                            <Edit3 size={16}/>
                        </Link>
                        <button onClick={() => handleDelete(car._id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                            <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}