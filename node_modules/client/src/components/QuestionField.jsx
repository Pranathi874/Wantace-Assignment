import React from 'react'

const fieldIcons = {
  roof_area: '📐',
  material: '🧱',
  pitch: '📐',
  layers: '🪵',
  stories: '🏠'
}

export default function QuestionField({ question, value, onChange }) {
  if (!question || question.active === false) return null

  const labelText = `${question.label}${question.unit ? ` (${question.unit})` : ''}`

  const questionCardStyle = {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    padding: '14px 14px 12px',
    margin: '12px 0',
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    transform: 'translateY(0)'
  }

  if (question.type === 'number') {
    return (
      <div
        style={questionCardStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 10px 22px rgba(15, 23, 42, 0.08)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, display: 'grid', placeItems: 'center', background: '#dbeafe', fontSize: 16 }}>{fieldIcons[question.key] || '🛠️'}</div>
          <label style={{ fontWeight: 700, color: '#0f172a' }}>{labelText}</label>
        </div>
        <input
          type="number"
          min={question.min}
          max={question.max}
          value={value || ''}
          onChange={(e) => onChange(question.key, e.target.value)}
          style={{ display: 'block', padding: '10px 12px', width: '100%', borderRadius: 10, border: '1px solid #dbe3ee', background: '#fff', boxSizing: 'border-box' }}
        />
      </div>
    )
  }

  if (question.type === 'select') {
    return (
      <div
        style={questionCardStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 10px 22px rgba(15, 23, 42, 0.08)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, display: 'grid', placeItems: 'center', background: '#e0f2fe', fontSize: 16 }}>{fieldIcons[question.key] || '✅'}</div>
          <label style={{ fontWeight: 700, color: '#0f172a' }}>{question.label}</label>
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          {question.options?.map((opt) => (
            <label
              key={opt.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                background: value === opt.value ? '#eff6ff' : '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <input
                type="radio"
                name={question.key}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(question.key, opt.value)}
                style={{ marginRight: 2 }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    )
  }

  return null
}
