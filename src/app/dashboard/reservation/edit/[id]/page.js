"use client";
import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { User, MapPin, Car, Save, Search, Clock, Tag, DollarSign, Info, Hash, Mail, Phone } from 'lucide-react';
import { nationalities } from '@/utils/constants';
import MapSelectionModal from '@/components/MapSelectionModal';
import OverlayLoader from '@/components/loader';

const sectionWrapper = "bg-white p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-sm mb-6";
const labelClass = "block text-slate-400 font-black text-[10px] mb-2 uppercase tracking-widest";
const inputClass = "w-full p-4 rounded-xl border-2 border-slate-100 focus:border-slate-900 outline-none font-bold text-slate-900 transition-all";

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3 mb-8 text-blue-600">
    <div className="bg-blue-50 p-2 rounded-lg"><Icon size={20} strokeWidth={3} /></div>
    <h2 className="font-black text-sm uppercase tracking-widest text-slate-900">{title}</h2>
  </div>
);

const FormInput = ({ label, type = "text", value, onChange, required, disabled, min, className = "" }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <input 
      type={type} required={required} disabled={disabled} min={min}
      className={`${inputClass} ${disabled ? 'bg-slate-50 text-slate-400' : ''} ${className}`} 
      value={value ?? ''} onChange={onChange} 
    />
  </div>
);

export default function EditReservationPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cars, setCars] = useState([]);
  const [selectedCarData, setSelectedCarData] = useState(null);
  const [mapModal, setMapModal] = useState({ open: false, field: '' });
  
  const [formData, setFormData] = useState({
    customerName: '', email: '', phone1: '', phone2: '', nationality: 'Egyptian',
    car: '', reservationType: '', 
    pickupLocation: { address: '', lat: 0, lng: 0 },
    dropoffLocation: { address: '', lat: 0, lng: 0 },
    fromDate: '', toDate: '', status: 'pending',
    rate: 0, extraHourCost: 0, extraKmCost: 0,
    additionalHours: 0, additionalKms: 0,
    additionalPrice: 0, discount: 0, cashDeposit: 0, paymentType: 'Cash'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCars, resBooking] = await Promise.all([
          api.get('/cars'),
          api.get(`/rentals/${id}`)
        ]);
        setCars(resCars.data);
        const booking = resBooking.data;
        
        setFormData({
          ...booking,
          car: booking.car?._id || booking.car,
          fromDate: booking.fromDate ? new Date(booking.fromDate).toISOString().slice(0, 16) : '',
          toDate: booking.toDate ? new Date(booking.toDate).toISOString().slice(0, 16) : '',
        });

        if (booking.car) {
           setSelectedCarData(typeof booking.car === 'object' ? booking.car : resCars.data.find(c => c._id === booking.car));
        }
      } catch (err) {
        alert("Failed to load reservation data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Financial Breakdown Logic
  const financialBreakdown = useMemo(() => {
    const base = Number(formData.rate) || 0;
    const hourTotal = (Number(formData.additionalHours) || 0) * (Number(formData.extraHourCost) || 0);
    const kmTotal = (Number(formData.additionalKms) || 0) * (Number(formData.extraKmCost) || 0);
    const misc = Number(formData.additionalPrice) || 0;
    const discount = Number(formData.discount) || 0;
    
    const gross = base + hourTotal + kmTotal + misc - discount;
    const balance = Math.max(0, gross - (Number(formData.cashDeposit) || 0));

    return { base, hourTotal, kmTotal, misc, discount, gross, balance };
  }, [formData]);

  const isBalanceZero = financialBreakdown.balance === 0;

  const handleLocationConfirm = (locationData) => {
    setFormData(prev => ({ ...prev, [mapModal.field]: locationData }));
    setMapModal({ open: false, field: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/rentals/${id}`, {
        ...formData,
        totalPrice: financialBreakdown.gross,
        cashRemain: financialBreakdown.balance
      });
      router.push('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || "Error updating reservation");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <OverlayLoader message="Retrieving Ledger Details..." />;

  return (
    <div className="bg-slate-50 min-h-screen p-4 lg:p-10 relative">
      {saving && <OverlayLoader message="Syncing Changes..." />}
      
      <MapSelectionModal 
        isOpen={mapModal.open}
        onClose={() => setMapModal({ open: false, field: '' })}
        onConfirm={handleLocationConfirm}
      />

      <div className="max-w-[850px] mx-auto">
        <form onSubmit={handleSubmit}>
          
          {/* PERSONAL INFORMATION */}
          <div className={sectionWrapper}>
            <SectionHeader icon={User} title="Personal Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Full Name" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} required />
                <FormInput label="Email Address" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <FormInput label="Primary Phone" type="tel" value={formData.phone1} onChange={e => setFormData({...formData, phone1: e.target.value})} required />
                <FormInput label="Secondary Phone" type="tel" value={formData.phone2} onChange={e => setFormData({...formData, phone2: e.target.value})} />
                <div className="md:col-span-2">
                    <label className={labelClass}>Nationality</label>
                    <select className={inputClass} value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})}>
                        {nationalities.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
            </div>
          </div>

          {/* CAR DETAILS & SELECTION */}
          <div className={sectionWrapper}>
            <SectionHeader icon={Car} title="Fleet Allocation" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClass}>Vehicle</label>
                    <select 
                        className={inputClass} 
                        value={formData.car} 
                        onChange={(e) => {
                            const car = cars.find(c => c._id === e.target.value);
                            setSelectedCarData(car);
                            setFormData({...formData, car: e.target.value});
                        }}
                    >
                        {cars.map(c => <option key={c._id} value={c._id}>{c.name_en} {c.model_en}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Reservation Type</label>
                    <select 
                        className={inputClass} 
                        value={formData.reservationType} 
                        onChange={(e) => setFormData({...formData, reservationType: e.target.value})}
                    >
                        {selectedCarData?.rentalOptions?.isFullDayRental && <option value="Full Day">Full Day</option>}
                        {selectedCarData?.rentalOptions?.isStandardRental && <option value="Original Pickup">Original Pickup</option>}
                        {selectedCarData?.rentalOptions?.isCityToCity && <option value="city to city">City to City</option>}
                        {selectedCarData?.rentalOptions?.isAirport && <option value="Airport Transfer">Airport Transfer</option>}
                    </select>
                </div>
            </div>
          </div>

          {/* FINANCIAL LEDGER */}
          <div className={sectionWrapper}>
            <SectionHeader icon={DollarSign} title="Financial Ledger" />
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <FormInput label="Base Rate" type="number" value={formData.rate} onChange={e => setFormData({...formData, rate: e.target.value})} />
                <FormInput label="Extra Hours Qty" type="number" value={formData.additionalHours} onChange={e => setFormData({...formData, additionalHours: e.target.value})} />
                <FormInput label="Extra Hour Price" type="number" value={formData.extraHourCost} onChange={e => setFormData({...formData, extraHourCost: e.target.value})} />
                <FormInput label="Extra KMs Qty" type="number" value={formData.additionalKms} onChange={e => setFormData({...formData, additionalKms: e.target.value})} />
                <FormInput label="Extra KM Price" type="number" value={formData.extraKmCost} onChange={e => setFormData({...formData, extraKmCost: e.target.value})} />
                <FormInput label="Misc Charges" type="number" value={formData.additionalPrice} onChange={e => setFormData({...formData, additionalPrice: e.target.value})} />
                <FormInput label="Discount" type="number" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} />
                <FormInput label="Paid Deposit" type="number" value={formData.cashDeposit} onChange={e => setFormData({...formData, cashDeposit: e.target.value})} />
            </div>

            {/* BREAKDOWN DISPLAY */}
            <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl">
                <div className="space-y-3 mb-6 border-b border-slate-800 pb-6">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                        <span>Base Rate</span>
                        <span className="text-white">${financialBreakdown.base}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                        <span>Extra Hours ({formData.additionalHours} x ${formData.extraHourCost})</span>
                        <span className="text-blue-400">+ ${financialBreakdown.hourTotal}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                        <span>Extra Kilometers ({formData.additionalKms} x ${formData.extraKmCost})</span>
                        <span className="text-blue-400">+ ${financialBreakdown.kmTotal}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                        <span>Misc Charges</span>
                        <span className="text-blue-400">+ ${financialBreakdown.misc}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                        <span>Discount Applied</span>
                        <span className="text-rose-400">- ${financialBreakdown.discount}</span>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400">Total Gross</span>
                        <h3 className="text-3xl font-black text-white">${financialBreakdown.gross.toLocaleString()}</h3>
                    </div>
                    <div className="border-l border-slate-800 pl-6">
                        <span className="text-[10px] font-black uppercase text-emerald-500">Total Due</span>
                        <h3 className="text-3xl font-black text-emerald-400">${financialBreakdown.balance.toLocaleString()}</h3>
                    </div>
                </div>
            </div>
          </div>

          {/* TRIP STATUS */}
          <div className={sectionWrapper}>
            <SectionHeader icon={Clock} title="Trip Control" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClass}>Operational Status</label>
                    <select 
                        className={`${inputClass} ${!isBalanceZero ? 'opacity-60 grayscale' : ''}`}
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                        <option value="pending">PENDING</option>
                        {isBalanceZero ? (
                            <>
                                <option value="active">ACTIVE TRIP</option>
                                <option value="complete">COMPLETED</option>
                            </>
                        ) : (
                            <option disabled>ACTIVE/COMPLETE (Clear Balance First)</option>
                        )}
                    </select>
                    {!isBalanceZero && (
                        <p className="text-[9px] font-bold text-rose-500 mt-2 flex items-center gap-1">
                            <Info size={12}/> Locked: Clear balance to activate trip.
                        </p>
                    )}
                </div>
                <div>
                    <label className={labelClass}>Payment Method</label>
                    <select className={inputClass} value={formData.paymentType} onChange={e => setFormData({...formData, paymentType: e.target.value})}>
                        <option value="Cash">Cash</option>
                        <option value="Visa">Visa</option>
                        <option value="Transfer">Transfer</option>
                    </select>
                </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-6 rounded-3xl transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl">
             <Save size={20}/> {saving ? 'Updating Ledger...' : 'Sync Reservation Ledger'}
          </button>

        </form>
      </div>
    </div>
  );
}