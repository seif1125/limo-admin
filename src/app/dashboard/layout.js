"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Car, Image as ImageIcon, MessageSquare, Settings, LogOut, Menu, X,Tag } from 'lucide-react';
import Cookies from 'js-cookie';
import api from '@/lib/api';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
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
    Cookies.remove('adminToken', { path: '/' });
    localStorage.clear();
    delete api.defaults.headers.common['Authorization'];
    router.push('/login');
    router.refresh();
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
        <div className="p-6 border-b border-slate-800 hidden md:block">
            <div className="flex flex-col items-center text-center gap-3">
                <img src="/logo.png" alt="VIP LIMOUSINE Logo" className="w-24 h-auto object-contain" />
                <div>
                    <span className="font-black text-sm block tracking-tighter text-white uppercase">VIP LIMOUSINE</span>
                    <span className="text-[10px] block text-blue-500 font-bold uppercase tracking-[0.2em]">Admin Panel</span>
                </div>
            </div>
        </div>
        
        <div className="h-16 md:hidden" />

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* We pass the pathname down to NavItem */}
          <NavItem href="/dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)} />
         <NavItem href="/dashboard/appsettings" icon={<Settings size={20}/>} label="App Settings" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)} />
         <NavItem href="/dashboard/categories" icon={<Tag size={20}/>} label="Categories" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem href="/dashboard/fleet" icon={<Car size={20}/>} label="Fleet" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)} />

          <NavItem href="/dashboard/banners" icon={<ImageIcon size={20}/>} label="Banners" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem href="/dashboard/testimonials" icon={<MessageSquare size={20}/>} label="Reviews" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem href="/dashboard/contact" icon={<Settings size={20}/>} label="Contact Info" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)} />
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center justify-between gap-3 px-2 py-1">
            <div className="overflow-hidden">
              <p className="text-xs font-black truncate text-white uppercase tracking-widest">{userData.name}</p>
              <p className="text-[10px] text-slate-500 truncate font-bold">{userData.email}</p>
            </div>
            <button 
              onClick={handleLogout} 
              className="text-red-400 hover:text-white p-2 hover:bg-red-600 transition rounded-lg"
            >
              <LogOut size={18}/> 
            </button>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <main className="flex-1 overflow-x-hidden w-screen ml-0 md:ml-64 p-4 md:p-10 min-h-screen pt-24 md:pt-10 transition-all">
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, pathname, onClick }) {
  // LOGIC: Check if it's an exact match for dashboard, or if the current path starts with the href
  const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`
        flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm border group
        ${isActive 
          ? 'bg-blue-600/20 text-blue-400 border-blue-900/50 shadow-[inset_0_0_10px_rgba(37,99,235,0.1)]' 
          : 'text-slate-400 border-transparent hover:bg-blue-600/10 hover:text-blue-400 hover:border-blue-900/50'
        }
      `}
    >
      <span className={`transition-transform duration-200 ${isActive ? 'scale-110 text-blue-400' : 'group-hover:scale-110'}`}>
        {icon}
      </span>
      <span>{label}</span>
      
      {/* Visual Dot for Active State */}
      {isActive && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
      )}
    </Link>
  );
}