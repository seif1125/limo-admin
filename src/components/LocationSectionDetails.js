import { MapPin, Target } from 'lucide-react';


const LocationDetailSection = ({ field, title }) => (
    <div className="space-y-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 mb-6">
        <div className="flex items-center justify-between mb-2">
            <h4 className="font-black text-xs uppercase tracking-tighter text-blue-600 flex items-center gap-2">
                <MapPin size={14}/> {title} Details
            </h4>
            <span className="text-[9px] font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100">
                GPS: {formData[field].lat.toFixed(4)}, {formData[field].lng.toFixed(4)}
            </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className={labelClass}>Property Type</label>
                <select 
                    className={inputClass} 
                    value={formData[field].type} 
                    onChange={e => setFormData({...formData, [field]: {...formData[field], type: e.target.value}})}
                >
                    <option value="Landmark">Landmark</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Office">Office</option>
                </select>
            </div>
            <div>
                <label className={labelClass}>Governorate</label>
                <select 
                    className={inputClass} 
                    value={formData[field].governorate} 
                    onChange={e => setFormData({...formData, [field]: {...formData[field], governorate: e.target.value}})}
                >
                    {egyptianGovernorates.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
            </div>
            <div>
                <label className={labelClass}>City/District</label>
                <input type="text" className={inputClass} placeholder="e.g. Maadi" value={formData[field].city} onChange={e => setFormData({...formData, [field]: {...formData[field], city: e.target.value}})} />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className={labelClass}>Street Address / Detailed Map Link</label>
                <div className="flex gap-2">
                    <input type="text" className={inputClass} value={formData[field].address} onChange={e => setFormData({...formData, [field]: {...formData[field], address: e.target.value}})} />
                    <button type="button" onClick={() => setMapModal({ open: true, field: field })} className="bg-slate-900 text-white p-4 rounded-xl hover:bg-blue-600 transition-colors">
                        <Target size={20}/>
                    </button>
                </div>
            </div>
            
            {/* Conditional Fields based on Type */}
            {formData[field].type === 'Landmark' && (
                <div><label className={labelClass}>Landmark Name</label><input type="text" className={inputClass} placeholder="e.g. Cairo Festival Mall Gate 2" value={formData[field].landmarkName} onChange={e => setFormData({...formData, [field]: {...formData[field], landmarkName: e.target.value}})} /></div>
            )}
            {(formData[field].type === 'Apartment' || formData[field].type === 'Flat') && (
                <div className="grid grid-cols-2 gap-2">
                    <div><label className={labelClass}>Apt No.</label><input type="text" className={inputClass} value={formData[field].aptNo} onChange={e => setFormData({...formData, [field]: {...formData[field], aptNo: e.target.value}})} /></div>
                    <div><label className={labelClass}>Floor</label><input type="text" className={inputClass} value={formData[field].floor} onChange={e => setFormData({...formData, [field]: {...formData[field], floor: e.target.value}})} /></div>
                </div>
            )}
            {formData[field].type === 'Villa' && (
                <div><label className={labelClass}>Villa No. / Name</label><input type="text" className={inputClass} value={formData[field].villaNo} onChange={e => setFormData({...formData, [field]: {...formData[field], villaNo: e.target.value}})} /></div>
            )}
            {formData[field].type === 'Office' && (
                <div className="grid grid-cols-2 gap-2">
                    <div><label className={labelClass}>Office Name/Co.</label><input type="text" className={inputClass} value={formData[field].officeName} onChange={e => setFormData({...formData, [field]: {...formData[field], officeName: e.target.value}})} /></div>
                    <div><label className={labelClass}>Floor</label><input type="text" className={inputClass} value={formData[field].floor} onChange={e => setFormData({...formData, [field]: {...formData[field], floor: e.target.value}})} /></div>
                </div>
            )}
        </div>
    </div>
  );

  export default LocationDetailSection;