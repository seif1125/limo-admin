import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Car, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6 pt-20">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated Icon */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-[#C5A25D]/20 blur-3xl rounded-full" />
          <Car size={80} className="relative text-[#C5A25D] mx-auto animate-bounce" />
        </div>

        <div className="space-y-4">
          <h1 className="text-8xl font-black text-[#0F172A] opacity-10">404</h1>
          <h2 className="text-3xl font-black text-[#0F172A] uppercase tracking-tight">
            {t('title') || 'Lost in the City?'}
          </h2>
          <p className="text-slate-500 font-medium">
            {t('description') || "The vehicle or page you're looking for has moved or doesn't exist."}
          </p>
        </div>

        <Link 
          href="/"
          className="inline-flex items-center gap-2 bg-[#0F172A] text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-[#C5A25D] transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          {t('goHome') || 'Back to Showroom'}
        </Link>
      </div>
    </main>
  );
}