"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { 
  ArrowLeft, Save, User, Phone, Mail, MapPin, 
  Navigation, Calendar, DollarSign, Car, Info, Zap, Timer
} from 'lucide-react';
import OverlayLoader from '@/components/loader';

export default function EditRentalPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone1: '',
    phone2: '',
    nationality: '',
    reservationType: '',
    pickupLocation: { address: '', lat: 0, lng: 0 },
    dropoffLocation: { address: '', lat: 0, lng: 0 },
    fromDate: '',
    toDate: '',
    rate: 0,
    additionalPrice: 0,
    totalPrice: 0,
    paymentType: 'Cash',
    cashDeposit: 0,
    status: 'pending',
    car: null // We store this just for display
  });

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const res = await api.get(`/rentals/${id}`);
        const data = res.data;
        
        // Format dates for input[type="datetime-local"]
        const formatDate = (dateStr) => {
          if (!dateStr) return '';
          return new Date(dateStr).toISOString().slice(0, 16);
        };

        setFormData({
          ...data,
          fromDate: formatDate(data.fromDate),
          toDate: formatDate(data.toDate),
        });
      } catch (err) {
        console.error(err);
        alert("Failed to load reservation data.");
      } finally {
        setLoading(false);
      }
    };
    fetchRental();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (type, field, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Calculate total price locally before saving
      const finalData = {
        ...formData,
        totalPrice: Number(formData.rate) + Number(formData.additionalPrice)
      };
      
      await api.put(`/rentals/${id}`, finalData);
      router.push('/dashboard'); // Back to fleet intelligence
    } catch (err) {
      alert("Update failed: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <OverlayLoader message="Retrieving Ledger Details..." />;

  const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block";
  const inputClass = "w-full text-slate-800 bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-slate-900 transition-all";

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8">
      {saving && <OverlayLoader message="Updating Global Ledger..." />}
      
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button 
            type="button"
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-black text-xs uppercase"
          >
            <ArrowLeft size={16} strokeWidth={3} /> Back to Dashboard
          </button>
          
          <button 
            type="submit" 
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200"
          >
            <Save size={18} /> Update Reservation
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Customer & Car info */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            {/* Read-Only Car Info (Disabled as requested) */}
            <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Car size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Assigned Vehicle</span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase">{formData.car?.name || "Unknown Car"}</h2>
                  <p className="text-slate-400 text-xs font-bold mt-1">{formData.car?.model} | {formData.car?.year}</p>
                  
                  <div className="mt-6 inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                    <Info size={12} /> Car changes are locked post-booking
                  </div>
               </div>
               <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Car size={120} strokeWidth={1} />
               </div>
            </div>

            {/* Customer Profile */}
            <div className="bg-white rounded-[2rem] p-8 border-2 border-slate-200 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <User size={16} className="text-blue-500" /> VIP Profile
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Primary Phone</label>
                  <input type="text" name="phone1" value={formData.phone1} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Nationality</label>
                  <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} className={inputClass} required />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Trip Details & Ledger */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Dispatch & Logistics */}
            <div className="bg-white rounded-[2rem] p-8 border-2 border-slate-200 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <Navigation size={16} className="text-emerald-500" /> Dispatch Logistics
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className={labelClass}>Reservation Type</label>
                  <input value={formData.reservationType} disabled className={`${inputClass} bg-slate-50 cursor-not-allowed`} />
                </div>
                <div>
                  <label className={labelClass}>Trip Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                    <option value="pending">PENDING</option>
                    <option value="active">ACTIVE TRIP</option>
                    <option value="completed">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Pickup Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                    <input type="text" value={formData.pickupLocation.address} onChange={(e) => handleLocationChange('pickupLocation', 'address', e.target.value)} className={`${inputClass} pl-12`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Dropoff Address</label>
                  <div className="relative">
                    <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" size={16} />
                    <input type="text" value={formData.dropoffLocation.address} onChange={(e) => handleLocationChange('dropoffLocation', 'address', e.target.value)} className={`${inputClass} pl-12`} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className={labelClass}>From Date/Time</label>
                  <input type="datetime-local" name="fromDate" value={formData.fromDate} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>To Date/Time</label>
                  <input type="datetime-local" name="toDate" value={formData.toDate} onChange={handleChange} className={inputClass} required />
                </div>
              </div>
            </div>

            {/* Revenue & Payment Ledger */}
            <div className="bg-white rounded-[2rem] p-8 border-2 border-slate-200 shadow-sm border-b-8 border-b-emerald-500">
               <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-500" /> Revenue Ledger
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Base Rate (EGP)</label>
                  <input type="number" name="rate" value={formData.rate} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Extra Surcharges</label>
                  <input type="number" name="additionalPrice" value={formData.additionalPrice} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Cash Deposit Paid</label>
                  <input type="number" name="cashDeposit" value={formData.cashDeposit} onChange={handleChange} className={`${inputClass} text-emerald-600`} />
                </div>
              </div>

              <div className="mt-8 p-6 bg-slate-900 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Calculated Balance Due</span>
                    <span className="text-3xl font-black text-white">
                      {(Number(formData.rate) + Number(formData.additionalPrice) - Number(formData.cashDeposit)).toLocaleString()} EGP
                    </span>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="text-right">
                       <span className="text-[10px] font-black text-slate-500 uppercase block">Method</span>
                       <select name="paymentType" value={formData.paymentType} onChange={handleChange} className="bg-transparent text-white font-black outline-none text-sm text-right">
                          <option value="Cash">CASH</option>
                          <option value="Visa">VISA</option>
                          <option value="Transfer">BANK TRANSFER</option>
                       </select>
                    </div>
                    <CreditCard className="text-blue-500" size={32} strokeWidth={2.5} />
                 </div>
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}

// Dummy CreditCard icon if missing from imports
function CreditCard({ className, size, strokeWidth }) {
    return <DollarSign className={className} size={size} strokeWidth={strokeWidth} />;
}