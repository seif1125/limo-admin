"use client";
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User, MapPin, Car, Save, DollarSign, Search, Loader2 } from 'lucide-react';
import { nationalities } from '@/utils/constants';
import { addHoursToDateStr, getMinDateTime } from '@/utils/utils';
import MapSelectionModal from '@/components/MapSelectionModal';

// --- UI HELPER COMPONENTS ---
const sectionWrapper = "bg-white p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-sm mb-6";
const labelClass = "block text-slate-400 font-black text-[10px] mb-2 uppercase tracking-widest";
const inputClass = "w-full p-4 rounded-xl border-2 border-slate-100 focus:border-slate-900 outline-none font-bold text-slate-900 transition-all";

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3 mb-8 text-blue-600">
    <div className="bg-blue-50 p-2 rounded-lg"><Icon size={20} strokeWidth={3} /></div>
    <h2 className="font-black text-sm uppercase tracking-widest text-slate-900">{title}</h2>
  </div>
);

const FormInput = ({ label, type = "text", value, onChange, required, disabled, min, max, className = "" }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <input 
      type={type} required={required} disabled={disabled} min={min} max={max}
      className={`${inputClass} ${disabled ? 'bg-slate-50 text-slate-400' : ''} ${className}`} 
      value={value} onChange={onChange} 
    />
  </div>
);

const StatRow = ({ label, value, highlightClass = "text-blue-400" }) => (
  <div className={`flex justify-between text-[10px] font-black uppercase tracking-widest ${highlightClass}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

// --- MAIN PAGE COMPONENT ---
export default function AddReservationPage() {
  const router = useRouter();
  
  // State
  const [loading, setLoading] = useState(false);
  const [cars, setCars] = useState([]);
  const [selectedCarData, setSelectedCarData] = useState(null);
  const [mapModal, setMapModal] = useState({ open: false, field: '' });
  const [formData, setFormData] = useState({
    customerName: '', email: '', phone1: '', phone2: '', nationality: 'Egyptian',
    car: '', reservationType: '',pickupLocation: { address: '', lat: 0, lng: 0 },
    dropoffLocation: { address: '', lat: 0, lng: 0 },
    fromDate: '', toDate: '', rate: 0, extraHourCost: 0, extraKmCost: 0,
    fullDayHours: 0, limitKilometers: 0, additionalHours: 0, additionalKms: 0,
    additionalPrice: 0, cashDeposit: 0, paymentType: 'Cash'
  });

  // Fetch Cars on Mount
  useEffect(() => {
    api.get('/cars')
      .then(res => setCars(res.data))
      .catch(err => console.error(err));
  }, []);

  // --- DERIVED DATA (Calculated on the fly, no need for useState) ---
  const isMissingData = !formData.customerName.trim() || !formData.phone1 || 
                        !formData.email || !formData.nationality || 
                        !formData.pickupLocation.address || !formData.dropoffLocation.address || 
                        !formData.fromDate || !formData.toDate || !selectedCarData;

  const minToDate = useMemo(() => {
    if (formData.reservationType === 'Full Day' && formData.fromDate) {
      return addHoursToDateStr(formData.fromDate, formData.fullDayHours);
    }
    return addHoursToDateStr(formData.fromDate, 1);
  }, [formData.fromDate, formData.fullDayHours, formData.reservationType]);

  const totalGross = useMemo(() => {
    const base = Number(formData.rate) || 0;
    const hourCost = (Number(formData.additionalHours) || 0) * (Number(formData.extraHourCost) || 0);
    const kmCost = (Number(formData.additionalKms) || 0) * (Number(formData.extraKmCost) || 0);
    const misc = Number(formData.additionalPrice) || 0;
    return base + hourCost + kmCost + misc;
  }, [formData]);

  const remainingBalance = useMemo(() => {
    let deposit = Number(formData.cashDeposit) || 0;
    if (deposit > totalGross) deposit = totalGross;
    if (deposit < 0) deposit = 0;
    return totalGross - deposit;
  }, [totalGross, formData.cashDeposit]);

  // --- HANDLERS ---
  const handleCarChange = (carId) => {
    if (!carId) {
      setSelectedCarData(null);
      return;
    }
    const car = cars.find(c => String(c._id) === String(carId));
    if (car) {
      setSelectedCarData(car);
      const opts = car.rentalOptions || {};
      const canFullDay = opts.isFullDayRental;
      const canStandard = opts.isStandardRental;

      let resType = '';
      if (canFullDay && !canStandard) resType = 'Full Day';
      else if (canStandard && !canFullDay) resType = 'Original Pickup';

      setFormData(prev => ({
        ...prev,
        car: carId,
        reservationType: resType,
        rate: car.price,
        fullDayHours: opts.fullDayHours || 0,
        limitKilometers: opts.limitKilometers || 0,
        extraHourCost: opts.extraHourCost || 0,
        extraKmCost: opts.extraKmCost || 0
      }));
    }
  };

  const handleFromDateChange = (val) => {
    setFormData(prev => {
      const updates = { fromDate: val };
      if (prev.reservationType === 'Full Day' && val) {
        updates.toDate = addHoursToDateStr(val, prev.fullDayHours);
      }
      return { ...prev, ...updates };
    });
  };

  const handleLocationConfirm = (locationData) => {
    setFormData(prev => ({ ...prev, [mapModal.field]:{
      address: locationData.address,
      lat: locationData.lat,
      lng: locationData.lng
    }
   }));
    setMapModal({ open: false, field: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/rentals', { ...formData, totalPrice: totalGross, cashRemain: remainingBalance });
      router.push('/dashboard');
    } catch (err) { 
      alert("Error saving log"); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    // Dynamic Extra Hours Calculation
    if (formData.reservationType === 'Full Day' && formData.fromDate && formData.toDate) {
      const start = new Date(formData.fromDate);
      const end = new Date(formData.toDate);
      const diffHrs = (end - start) / (1000 * 60 * 60);
      const extraHrs = Math.max(0, Math.floor(diffHrs - formData.fullDayHours));
      
      if (formData.additionalHours !== extraHrs) {
        setFormData(prev => ({ ...prev, additionalHours: extraHrs }));
      }
    }
  }, [formData.fromDate, formData.toDate, formData.reservationType, formData.fullDayHours]);

  return (
    <div className="bg-slate-50 min-h-screen p-4 lg:p-10 relative">
      <MapSelectionModal 
        isOpen={mapModal.open}
        onClose={() => setMapModal({ open: false, field: '' })}
        onConfirm={handleLocationConfirm}
      />

      <div className="max-w-[850px] mx-auto">
        <form onSubmit={handleSubmit}>
          
          {/* CLIENT IDENTITY */}
          <div className={sectionWrapper}>
            <SectionHeader icon={User} title="Client Identity" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <FormInput label="Customer Name" required value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
              </div>
              <FormInput label="Phone 1" type="tel" required value={formData.phone1} onChange={e => setFormData({...formData, phone1: e.target.value})} />
              <FormInput label="Phone 2" type="tel" value={formData.phone2} onChange={e => setFormData({...formData, phone2: e.target.value})} />
              
              <div>
                <label className={labelClass}>Nationality</label>
                <select className={`${inputClass} cursor-pointer`} value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})}>
                  {nationalities.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <FormInput label="Email Address" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          {/* VEHICLE ALLOCATION */}
          <div className={sectionWrapper}>
            <SectionHeader icon={Car} title="Vehicle Allocation" />
            <select required className={`${inputClass} mb-6 cursor-pointer`} value={selectedCarData?._id || ''} onChange={e => handleCarChange(e.target.value)}>
              <option value="">Search Fleet...</option>
              {cars.map(c => <option key={c._id} value={c._id}>{c.name} | {c.model}</option>)}
            </select>
            
            {selectedCarData && (
              <div className="grid grid-cols-2 gap-4">
                {selectedCarData.rentalOptions?.isFullDayRental && (
                  <button type="button" 
                    onClick={() => setFormData({...formData, reservationType: 'Full Day', toDate:'', fromDate:'', dropoffLocation:'', pickupLocation:'', additionalHours:0, additionalKms:0, additionalPrice:0, cashDeposit:0, extraHourCost: selectedCarData.rentalOptions.extraHourCost, extraKmCost: selectedCarData.rentalOptions.extraKmCost})} 
                    className={`p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${formData.reservationType === 'Full Day' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400'}`}>
                    Full Day
                  </button>
                )}
                {selectedCarData.rentalOptions?.isStandardRental && (
                  <button type="button" 
                    onClick={() => setFormData({...formData, reservationType: 'Original Pickup', toDate:'', fromDate:'', dropoffLocation:'', pickupLocation:'', additionalHours:0, additionalKms:0, additionalPrice:0, cashDeposit:0, extraHourCost: selectedCarData.rentalOptions.extraHourCost, extraKmCost: selectedCarData.rentalOptions.extraKmCost})} 
                    className={`p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${formData.reservationType === 'Original Pickup' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400'}`}>
                    Pickup Only
                  </button>
                )}
              </div>
            )}
            
            {selectedCarData && formData.reservationType && (
              <div className="flex flex-col gap-4 mt-6">
                <FormInput label="Base Rate" disabled value={selectedCarData.price} />
                
                {formData.reservationType === 'Full Day' && (
                  <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                    <FormInput label="Full Day Hours Limit" disabled value={formData.fullDayHours} />
                    <FormInput label="Kilometers Limit" disabled value={formData.limitKilometers} />
                    <FormInput label="Ex. Hour Cost" disabled value={formData.extraHourCost} />
                    <FormInput label="Ex. KM Cost" disabled value={formData.extraKmCost} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ROUTE & TIMING */}
          {selectedCarData && formData.reservationType && (
            <div className={sectionWrapper}>
              <SectionHeader icon={MapPin} title="Route & Timing" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                
              <div>
  <label className={labelClass}>Pickup</label>
  <div className="flex gap-2">
    <input 
      type="text" 
      className={inputClass} 
      value={formData.pickupLocation.address} // Changed from .pickupLocation
      readOnly 
      placeholder="Select on Map..." 
    />
    <button type="button" onClick={() => setMapModal({ open: true, field: 'pickupLocation' })} className="bg-slate-900 text-white p-4 rounded-xl">
      <Search size={20}/>
    </button>
  </div>
</div>

<div>
  <label className={labelClass}>Dropoff</label>
  <div className="flex gap-2">
    <input 
      type="text" 
      className={inputClass} 
      value={formData.dropoffLocation.address} // Changed from .dropoffLocation
      readOnly 
      placeholder="Select on Map..." 
    />
    <button type="button" onClick={() => setMapModal({ open: true, field: 'dropoffLocation' })} className="bg-slate-900 text-white p-4 rounded-xl">
      <Search size={20}/>
    </button>
  </div>
</div>
                  
                <FormInput label="Start" type="datetime-local" min={getMinDateTime('now', formData)} value={formData.fromDate} onChange={e => handleFromDateChange(e.target.value)} />
                
                <FormInput label="End" type="datetime-local" min={getMinDateTime('min', formData)} value={formData.toDate} 
                  onChange={e => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev, 
                      toDate: (prev.reservationType === 'Full Day' && minToDate && new Date(val) < new Date(minToDate)) ? minToDate : val
                    }));
                  }} 
                />
              </div>
            </div>
          )}

          {/* FINAL SETTLEMENT & LEDGER */}
          {selectedCarData && formData.dropoffLocation && formData.pickupLocation && formData.fromDate && formData.toDate && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* OPERATIONAL LEDGER */}
              <div className={sectionWrapper}>
                <SectionHeader icon={DollarSign} title="Adjustment Ledger" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="relative">
                    <FormInput label="Base Rate (Negotiated)" type="number" min={0} value={formData.rate} onChange={e => setFormData({...formData, rate: Number(e.target.value)})} />
                    {formData.rate !== selectedCarData.price && (
                      <div className={`mt-4 left-2 text-[9px] font-black uppercase tracking-tighter ${formData.rate > selectedCarData.price ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {formData.rate > selectedCarData.price ? '↑ Increase' : '↓ Discount'} by {Math.abs(((formData.rate - selectedCarData.price) / selectedCarData.price) * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>

                  {formData.reservationType === 'Full Day' && (
                    <> 
                      <div className="relative">
                        <FormInput label="Extra Hour Rate" type="number" min={0} value={formData.extraHourCost} onChange={e => setFormData({...formData, extraHourCost: Number(e.target.value)})} />
                        {formData.extraHourCost !== selectedCarData.rentalOptions.extraHourCost && (
                          <div className={`mt-4 bottom-6 left-2 text-[9px] font-black uppercase tracking-tighter ${formData.extraHourCost > selectedCarData.rentalOptions.extraHourCost ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {formData.extraHourCost > selectedCarData.rentalOptions.extraHourCost ? '↑ Increase' : '↓ Discount'} by {Math.abs(((formData.extraHourCost - selectedCarData.rentalOptions.extraHourCost) / selectedCarData.rentalOptions.extraHourCost) * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <FormInput label="Extra KM Rate" type="number" min={0} value={formData.extraKmCost} onChange={e => setFormData({...formData, extraKmCost: Number(e.target.value)})} />
                        {formData.extraKmCost !== selectedCarData.rentalOptions.extraKmCost && (
                          <div className={`mt-4 bottom-6 left-2 text-[9px] font-black uppercase tracking-tighter ${formData.extraKmCost > selectedCarData.rentalOptions.extraKmCost ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {formData.extraKmCost > selectedCarData.rentalOptions.extraKmCost ? '↑ Increase' : '↓ Discount'} by {Math.abs(((formData.extraKmCost - selectedCarData.rentalOptions.extraKmCost) / selectedCarData.rentalOptions.extraKmCost) * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  {formData.reservationType === 'Full Day' && (
                    <> 
                      <div>
                        <FormInput 
                          label="Add. Hours Quantity" type="number" min={0} 
                          value={formData.additionalHours} disabled={true} 
                          onChange={e => setFormData({...formData, additionalHours: Number(e.target.value)})} 
                        />
                        <span className="text-[9px] font-black text-blue-500 uppercase mt-1 block">Date Auto-Calculated</span>
                      </div>
                      <FormInput label="Add. KM Quantity" type="number" min={0} value={formData.additionalKms} onChange={e => setFormData({...formData, additionalKms: Number(e.target.value)})} />
                    </>
                  )}
                  <FormInput label="Misc. Additions" type="number" min={0} value={formData.additionalPrice} onChange={e => setFormData({...formData, additionalPrice: Number(e.target.value)})} />
                </div>
              </div>

              {/* TOTAL SETTLEMENT (The Black Box) */}
              <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl border-2 border-slate-800">
                <div className="mb-10 space-y-3 border-b border-slate-800 pb-8">
                  <StatRow label="Base Contract Rate" value={`${formData.rate.toLocaleString()} USD`} highlightClass="text-slate-500" />
                  {formData.additionalHours > 0 && <StatRow label={`Extra Hours (${formData.additionalHours} × ${formData.extraHourCost})`} value={`+${(formData.additionalHours * formData.extraHourCost).toLocaleString()} USD`} />}
                  {formData.additionalKms > 0 && <StatRow label={`Extra Distance (${formData.additionalKms} × ${formData.extraKmCost})`} value={`+${(formData.additionalKms * formData.extraKmCost).toLocaleString()} USD`} />}
                  {formData.additionalPrice > 0 && <StatRow label="Misc. Additional Fees" value={`+${formData.additionalPrice.toLocaleString()} USD`} highlightClass="text-amber-400" />}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
                  <div className="space-y-6">
                    <div>
                      <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] mb-1">Gross Total</p>
                      <div className="flex items-baseline gap-2 text-white">
                        <span className="text-6xl font-black tracking-tighter">{totalGross.toLocaleString()}</span>
                        <span className="text-blue-500 text-xs font-black uppercase">USD</span>
                      </div>
                    </div>
                    
                    <div className="flex lg:flex-row flex-col gap-4 items-center">
                       <div className="flex-1 w-full">
                          <label className="text-slate-500 font-black text-[9px] uppercase mb-2 block tracking-widest text-emerald-500">Cash Deposit</label>
                          <input type="number" min={0} max={totalGross} className="w-full bg-slate-800 border-2 border-emerald-500/20 rounded-2xl p-4 text-emerald-400 font-black text-xl outline-none focus:border-emerald-500 transition-all" value={formData.cashDeposit} onChange={e => setFormData({...formData, cashDeposit: Number(e.target.value)})} />
                       </div>
                       <div className="flex-1 w-full">
                          <label className="text-slate-500 font-black text-[9px] uppercase mb-2 block tracking-widest">Remaining Balance</label>
                          <div className="w-full bg-slate-800/50 rounded-2xl p-4 text-white font-black text-xl border-2 border-slate-700">
                            {remainingBalance.toLocaleString()}
                          </div>
                       </div>
                    </div>
                  </div>

                  <button type="submit" disabled={loading || isMissingData} className={`group relative overflow-hidden p-5 rounded-3xl font-black text-[10px] uppercase tracking-widest border-2 text-white flex items-center justify-center ${loading || isMissingData ? 'bg-slate-600 border-slate-600 cursor-not-allowed' : 'bg-blue-600 border-blue-600 hover:bg-blue-500 cursor-pointer'}`} >  
                    <div className="relative z-10 flex items-center justify-center gap-1 lg:gap-3 py-2">
                      {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                      <span className="text-sm">{loading ? "Syncing..." : "Finalize Rental"}</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}