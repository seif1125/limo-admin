"use client";
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Search, X, Target, Loader2, Info, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Dynamic imports for Leaflet to prevent SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const useMapEvents = dynamic(() => import('react-leaflet').then(mod => mod.useMapEvents), { ssr: false });

export default function MapSelectionModal({ isOpen, onClose, onConfirm, defaultPos = [30.0444, 31.2357] }) {
  const [mapPos, setMapPos] = useState(defaultPos);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Fix Leaflet icons
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
  }, []);

  const handleSearchInput = (value) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (value.length < 3) { setSearchResults([]); return; }
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&countrycodes=eg`, { headers: { 'User-Agent': 'FleetManagerApp/1.1' } });
        if (res.ok) { const data = await res.json(); setSearchResults(data); }
      } catch (err) { console.error(err); } 
      finally { setIsSearching(false); }
    }, 600); 
  };

  const selectLocation = (item) => {
    setMapPos([parseFloat(item.lat), parseFloat(item.lon)]);
    setSearchQuery(item.display_name);
    setSearchResults([]);
  };

  const getMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => { setMapPos([pos.coords.latitude, pos.coords.longitude]); });
    }
  };

  const handleConfirm = async () => {
    setIsSearching(true);
    let finalAddress = "Custom Point";
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${mapPos[0]}&lon=${mapPos[1]}`);
        const data = await res.json();
        if (data.display_name) finalAddress = data.display_name;
    } catch (err) {
        finalAddress = `${mapPos[0].toFixed(4)}, ${mapPos[1].toFixed(4)}`;
    }
    
    setIsSearching(false);
    // Pass data back to parent
    onConfirm({
      address: finalAddress,
      lat: mapPos[0],
      lng: mapPos[1]
    });
  };

  function MapController() {
    const map = useMapEvents({
      click(e) {
        setMapPos([e.latlng.lat, e.latlng.lng]);
      },
    });
    useEffect(() => {
      if (map && typeof map.flyTo === 'function') map.flyTo(mapPos, 14, { animate: true });
    }, [mapPos, map]);
    return null;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col h-[85vh]">
        {/* Header & Search Bar */}
        <div className="p-6 bg-white border-b border-slate-100">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Select Location</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={24} className="text-slate-400" />
            </button>
          </div>

          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500 z-10">
              <Search size={20} strokeWidth={3} />
            </div>
            <input 
              type="text" 
              className="w-full pl-14 pr-14 py-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-700 transition-all shadow-inner"
              placeholder="Search for an Egyptian address or landmark..." 
              value={searchQuery} 
              onChange={(e) => handleSearchInput(e.target.value)} 
            />
            {isSearching && (
              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                <Loader2 className="animate-spin text-blue-500" size={20} />
              </div>
            )}

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-[110%] left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[2000] animate-in fade-in zoom-in-95 duration-200">
                {searchResults.map((item, i) => (
                  <button 
                    key={i} type="button" onClick={() => selectLocation(item)} 
                    className="w-full text-left p-4 hover:bg-blue-50 border-b last:border-0 flex items-start gap-4 transition-colors"
                  >
                    <MapPin size={18} className="mt-1 text-blue-400 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 truncate">{item.display_name.split(',')[0]}</p>
                      <p className="text-[11px] text-slate-500 truncate">{item.display_name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map Content */}
        <div className="flex-1 relative bg-slate-100">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] bg-slate-900/90 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-2 shadow-xl animate-bounce pointer-events-none border border-slate-700">
            <Info size={16} className="text-blue-400" />
            <span>Drag the blue pin to fine-tune your location</span>
          </div>
          <MapContainer center={mapPos} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }} className="z-0">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapController />
            <Marker 
              position={mapPos} draggable={true}
              eventHandlers={{ dragend: (e) => setMapPos([e.target.getLatLng().lat, e.target.getLatLng().lng]) }}
            />
          </MapContainer>

          <button onClick={getMyLocation} className="absolute top-6 right-6 z-[500] bg-white p-4 rounded-2xl shadow-xl text-blue-600 border border-slate-100 active:scale-90 transition-all hover:bg-blue-50">
            <Target size={28} strokeWidth={2.5} />
          </button>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[500] w-full max-w-xs px-4">
            <button onClick={handleConfirm} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl flex items-center justify-center gap-4 hover:bg-slate-800 active:scale-95 transition-all">
              <div className="bg-blue-500 p-1.5 rounded-lg"><MapPin size={16} className="text-white"/></div>
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}