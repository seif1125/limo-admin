"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, User, Calendar, MapPin, Car, Globe, Phone, Save } from 'lucide-react';
import Link from 'next/link';
import OverlayLoader from '@/components/loader';

export default function AddReservationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cars, setCars] = useState([]);
  
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone1: '',
    phone2: '',
    nationality: '',
    car: '', // Car ID
    fromDate: '',
    toDate: '',
    notes: ''
  });

  // Fetch cars for the dropdown
  useEffect(() => {
    api.get('/cars').then(res => setCars(res.data)).catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/rentals', formData);
      router.push('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create reservation");
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "block text-slate-900 font-black text-[11px] mb-2 uppercase tracking-widest";
  const inputClass = "w-full p-4 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:ring-0 bg-white text-slate-900 font-bold outline-none mb-6 transition-all placeholder:text-slate-300 shadow-sm";
  const sectionHeader = "text-blue-600 font-black text-[11px] mb-8 border-b-2 border-slate-100 pb-2 uppercase tracking-[0.2em] flex items-center gap-2";

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:p-10">
      {loading && <OverlayLoader message="Creating Reservation..." />}
      
      <div className="max-w-[1000px] mx-auto">
        <Link href="/dashboard" className="text-slate-500 font-black flex items-center gap-2 mb-8 no-underline text-xs hover:text-slate-900 transition-colors uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Hub
        </Link>

        <div className="bg-white p-6 md:p-12 rounded-3xl border-2 border-slate-300 shadow-xl">
          <div className="flex items-center gap-4 mb-12">
            <div className="bg-slate-900 p-3 rounded-2xl shadow-lg">
                <Calendar className="text-white" size={32} />
            </div>
            <h1 className="font-black text-3xl md:text-4xl text-slate-900 m-0 tracking-tighter uppercase">New Booking</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">
              
              {/* LEFT COLUMN: CUSTOMER INFO */}
              <div>
                <div className={sectionHeader}><User size={14} /> Customer Information</div>
                
                <label className={labelClass}>Full Name</label>
                <input 
                  type="text" required className={inputClass} placeholder="e.g. John Smith"
                  value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})}
                />

                <label className={labelClass}>Email Address</label>
                <input 
                  type="email" required className={inputClass} placeholder="john@example.com"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Phone 1</label>
                        <input 
                            type="tel" required className={inputClass} placeholder="+1..."
                            value={formData.phone1} onChange={e => setFormData({...formData, phone1: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Phone 2 (Opt)</label>
                        <input 
                            type="tel" className={inputClass} placeholder="+1..."
                            value={formData.phone2} onChange={e => setFormData({...formData, phone2: e.target.value})}
                        />
                    </div>
                </div>

                <label className={labelClass}>Nationality</label>
                <input 
                  type="text" required className={inputClass} placeholder="e.g. British"
                  value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})}
                />
              </div>

              {/* RIGHT COLUMN: TRIP & VEHICLE */}
              <div>
                <div className={sectionHeader}><Car size={14} /> Trip Details</div>
                
                <label className={labelClass}>Select Vehicle</label>
                <select 
                   required className={inputClass}
                   value={formData.car} onChange={e => setFormData({...formData, car: e.target.value})}
                >
                    <option value="">Choose a car...</option>
                    {cars.map(c => (
                        <option key={c._id} value={c._id}>{c.name.en} ({c.model.en})</option>
                    ))}
                </select>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>From Date</label>
                        <input 
                            type="date" required className={inputClass}
                            value={formData.fromDate} onChange={e => setFormData({...formData, fromDate: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>To Date</label>
                        <input 
                            type="date" required min={Date().now} className={inputClass}
                            value={formData.toDate} onChange={e => setFormData({...formData, toDate: e.target.value})}
                        />
                    </div>
                </div>

                <label className={labelClass}>Special Notes / Requirements</label>
                <textarea 
                  className={`${inputClass} h-[135px] resize-none`} 
                  placeholder="Flight number, child seat, specific location details..."
                  value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-blue-600 text-white p-6 rounded-2xl font-black text-lg tracking-[0.2em] mt-8 transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 uppercase"
            >
              <Save size={20} /> Confirm & Save Reservation
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}