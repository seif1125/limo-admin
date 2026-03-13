"use client";
import { Loader2 } from 'lucide-react';

export default function OverlayLoader({ message }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(2px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      cursor: 'wait'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '30px 50px',
        borderRadius: '16px',
        border: '2px solid #cbd5e1',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px'
      }}>
        {/* We use a simple inline animation style to avoid JSX styling conflicts */}
        <div className="spinner-container">
           <Loader2 size={48} color="#2563eb" strokeWidth={3} />
        </div>
        
        <p style={{ 
          color: '#0f172a', 
          fontWeight: '900', 
          fontSize: '14px', 
          textTransform: 'uppercase',
          letterSpacing: '1px',
          margin: 0
        }}>
          {message || "Processing..."}
        </p>
      </div>

      {/* Using a standard HTML style tag is safer for hydration than <style jsx> */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinner-container {
          animation: spin 1s linear infinite;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}} />
    </div>
  );
}