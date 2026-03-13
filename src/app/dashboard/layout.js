"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Car, Image as ImageIcon, MessageSquare, Settings, LogOut, Menu, X } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [userData, setUserData] = useState({ name: 'Admin', email: '' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse user data", err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-900 text-white p-4 flex justify-between items-center z-50 shadow-md">
        <div className="flex items-center gap-2">
            <img src="/logo.png" alt="VIP LIMOUSINE" className="h-8 w-auto object-contain" />
            <span className="font-bold text-xs tracking-widest uppercase">VIP Limousine</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-slate-800 rounded-md transition"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`
        fixed h-full w-64 bg-slate-900 text-white flex flex-col z-40 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        {/* LOGO SECTION */}
        <div className="p-6 border-b border-slate-800 hidden md:block">
            <div className="flex flex-col items-center text-center gap-3">
                <img src="/logo.png" alt="VIP LIMOUSINE Logo" className="w-24 h-auto object-contain" />
                <div>
                    <span className="font-black text-sm block tracking-tighter text-white">VIP LIMOUSINE</span>
                    <span className="text-[10px] block text-blue-500 font-bold uppercase tracking-[0.2em]">Admin Panel</span>
                </div>
            </div>
        </div>
        
        {/* Mobile Spacer */}
        <div className="h-16 md:hidden" />

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem href="/dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem href="/dashboard/fleet" icon={<Car size={20}/>} label="Fleet" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem href="/dashboard/banners" icon={<ImageIcon size={20}/>} label="Banners" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem href="/dashboard/testimonials" icon={<MessageSquare size={20}/>} label="Reviews" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem href="/dashboard/contact" icon={<Settings size={20}/>} label="Contact Info" onClick={() => setIsMobileMenuOpen(false)} />
        </nav>

        {/* User Info & Logout Section */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center justify-between gap-3 px-2 py-1">
            <div className="overflow-hidden">
              <p className="text-xs font-black truncate text-white uppercase tracking-widest">
                {userData.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate font-bold">
                {userData.email}
              </p>
            </div>
            <button 
              onClick={handleLogout} 
              className="text-red-400 hover:text-white p-2 hover:bg-red-600 transition rounded-lg"
              title="Logout"
            >
              <LogOut size={18}/> 
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-x-hidden w-screen ml-0 md:ml-64 p-4 md:p-10 min-h-screen pt-24 md:pt-10 transition-all">
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, onClick }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-600/10 transition-all text-slate-400 hover:text-blue-400 font-bold text-sm border border-transparent hover:border-blue-900/50 group"
    >
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}