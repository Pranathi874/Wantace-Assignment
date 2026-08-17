import React, { useState } from 'react'
import Estimator from './pages/Estimator'
import Owner from './pages/Owner'

export default function App() {
  const [activeView, setActiveView] = useState('estimator')

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fb 0%, #edf6ff 32%, #f8fafc 100%)',
        fontFamily: 'system-ui, sans-serif',
        color: '#0f172a',
        padding: '32px 20px 60px'
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 18,
            flexWrap: 'wrap',
            marginBottom: 26,
            padding: '18px 22px',
            borderRadius: 22,
            background: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(148,163,184,0.25)',
            boxShadow: '0 10px 25px rgba(15, 23, 42, 0.06)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Roofing Co.</div>
            <h1 style={{ margin: '6px 0 0', fontSize: 'clamp(1.8rem, 3vw, 2.9rem)' }}>Northline Roofing</h1>
          </div>

          <nav style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveView('estimator')}
              style={{
                padding: '10px 18px',
                borderRadius: 999,
                border: '1px solid #dbe3ee',
                background: activeView === 'estimator' ? '#0f172a' : '#ffffff',
                color: activeView === 'estimator' ? '#ffffff' : '#111827',
                cursor: 'pointer',
                fontWeight: 700,
                boxShadow: activeView === 'estimator' ? '0 10px 20px rgba(15, 23, 42, 0.18)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Estimator
            </button>
            <button
              onClick={() => setActiveView('owner')}
              style={{
                padding: '10px 18px',
                borderRadius: 999,
                border: '1px solid #dbe3ee',
                background: activeView === 'owner' ? '#0f172a' : '#ffffff',
                color: activeView === 'owner' ? '#ffffff' : '#111827',
                cursor: 'pointer',
                fontWeight: 700,
                boxShadow: activeView === 'owner' ? '0 10px 20px rgba(15, 23, 42, 0.18)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Owner Panel
            </button>
          </nav>
        </header>

        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 28,
            background: 'linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.7)), url(https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1400&q=80) center/cover no-repeat',
            minHeight: 210,
            padding: '32px 28px',
            marginBottom: 28,
            boxShadow: '0 24px 55px rgba(15, 23, 42, 0.16)'
          }}
        >
          <div style={{ maxWidth: 620, color: '#fff' }}>
            <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.8 }}>Trusted roofing partners</p>
            <h2 style={{ margin: '12px 0 10px', fontSize: 'clamp(2rem, 4vw, 3.4rem)', lineHeight: 1.05 }}>Fast, accurate roofing estimates.</h2>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' }}>
              Build a quick quote with configurable roofing options, pricing modifiers, and owner-side controls.
            </p>
          </div>
        </div>

        {activeView === 'owner' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 14,
              marginBottom: 28
            }}
          >
            {([
              { label: 'Open leads', value: '24', tone: '#e0f2fe' },
              { label: 'Config version', value: 'v3', tone: '#dcfce7' },
              { label: 'Avg quote', value: '$18.2k', tone: '#fef3c7' },
              { label: 'Status', value: 'Live', tone: '#fce7f3' }
            ]).map((item) => (
              <div
                key={item.label}
                style={{
                  background: item.tone,
                  border: '1px solid rgba(148,163,184,0.2)',
                  borderRadius: 18,
                  padding: '18px 20px',
                  boxShadow: '0 14px 26px rgba(15, 23, 42, 0.08)',
                  display: 'grid',
                  gap: 8,
                  minHeight: 120
                }}
              >
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#475569', fontWeight: 700 }}>{item.label}</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: '#0f172a' }}>{item.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 12,
              marginBottom: 28
            }}
          >
            {([
              'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=600&q=80'
            ]).map((img, idx) => (
              <div
                key={idx}
                style={{
                  height: 120,
                  borderRadius: 18,
                  overflow: 'hidden',
                  boxShadow: '0 16px 30px rgba(15, 23, 42, 0.08)',
                  border: '1px solid rgba(148,163,184,0.18)',
                  transform: 'translateY(0)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 18px 34px rgba(15, 23, 42, 0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 16px 30px rgba(15, 23, 42, 0.08)'
                }}
              >
                <img src={img} alt="Roofing project" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
          </div>
        )}

        {activeView === 'estimator' ? <Estimator /> : <Owner />}
      </div>
    </div>
  )
}
