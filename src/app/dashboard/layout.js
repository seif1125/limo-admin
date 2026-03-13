"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Car, Image as ImageIcon, MessageSquare, Settings, LogOut } from 'lucide-react';

export default function DashboardLayout({ children }) {
    const router = useRouter();

const handleLogout = () => {
  localStorage.removeItem('adminToken');
  router.push('/login');
};
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full">
        <div className="p-6 text-xl font-bold border-b border-slate-800">
          MONOCHROME <span className="text-xs block text-slate-400 font-normal">ADMIN PANEL</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem href="/dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
          <NavItem href="/dashboard/fleet" icon={<Car size={20}/>} label="Fleet" />
          <NavItem href="/dashboard/banners" icon={<ImageIcon size={20}/>} label="Banners" />
          <NavItem href="/dashboard/testimonials" icon={<MessageSquare size={20}/>} label="Reviews" />
          <NavItem href="/dashboard/contact" icon={<Settings size={20}/>} label="Contact Info" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-white transition w-full p-2">
            <LogOut size={20}/> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8" style={{
    "width": "100%",
    "overflowX": "hidden"
}}>
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, icon, label }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition text-slate-300 hover:text-white">
      {icon} <span>{label}</span>
    </Link>
  );
}
