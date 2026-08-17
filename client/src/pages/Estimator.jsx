import React, { useEffect, useState } from 'react'
import QuestionField from '../components/QuestionField'

export default function Estimator() {
  const [config, setConfig] = useState(null)
  const [answers, setAnswers] = useState({})
  const [contact, setContact] = useState({ name: '', email: '', phone: '' })
  const [result, setResult] = useState(null)
  const currencySymbol = config?.business?.currency === 'INR' ? '₹' : '$'

  useEffect(() => {
    fetch('/api/config').then((r) => r.json()).then(setConfig).catch(console.error)
  }, [])

  function onChange(key, val) {
    setAnswers((s) => ({ ...s, [key]: val }))
  }

  async function submit() {
    const payload = { ...contact, answers }
    const res = await fetch('/api/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (res.ok) setResult(data)
    else alert(data.error || 'Estimate failed')
  }

  if (!config) return <div style={styles.loading}>Loading configuration...</div>

  return (
    <div style={styles.wrapper}>
      <div style={styles.leftPanel}>
        <div style={styles.sectionTitleBlock}>
          <p style={styles.kicker}>Estimate Builder</p>
          <h3 style={styles.h3}>Roofing Project Details</h3>
        </div>

        <div style={styles.formCard}>
          {config.questions.sort((a, b) => (a.order || 0) - (b.order || 0)).map((q) => (
            <QuestionField key={q.key} question={q} value={answers[q.key]} onChange={onChange} />
          ))}
        </div>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.contactCard}>
          <div style={styles.sectionTitleBlock}>
            <p style={styles.kicker}>Contact</p>
            <h3 style={styles.h3}>Tell us who to reach</h3>
          </div>

          <input
            placeholder="Name"
            value={contact.name}
            onChange={(e) => setContact({ ...contact, name: e.target.value })}
            style={styles.input}
          />
          <input
            placeholder="Email"
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            style={styles.input}
          />
          <input
            placeholder="Phone"
            value={contact.phone}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            style={styles.input}
          />

          <button onClick={submit} style={styles.primaryButton}>Get Estimate</button>
        </div>

        {result && (
          <div style={styles.resultCard}>
            <p style={styles.kicker}>Estimated range</p>
            <div style={styles.resultValue}>{currencySymbol}{result.estimate_low.toLocaleString()} - {currencySymbol}{result.estimate_high.toLocaleString()}</div>
            <div style={styles.resultNote}>Based on your selected roof profile and modifiers.</div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    display: 'grid',
    gridTemplateColumns: '1.7fr 0.9fr',
    gap: 22,
    alignItems: 'start'
  },
  leftPanel: { display: 'grid', gap: 18 },
  rightPanel: { display: 'grid', gap: 18 },
  loading: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 18,
    padding: 24,
    color: '#475569'
  },
  sectionTitleBlock: { marginBottom: 6 },
  kicker: { margin: 0, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' },
  h3: { margin: '6px 0 0', fontSize: 24 },
  formCard: {
    background: 'rgba(255,255,255,0.88)',
    border: '1px solid rgba(148,163,184,0.2)',
    borderRadius: 22,
    boxShadow: '0 14px 30px rgba(15, 23, 42, 0.06)',
    padding: 18
  },
  contactCard: {
    background: 'rgba(255,255,255,0.9)',
    border: '1px solid rgba(148,163,184,0.2)',
    borderRadius: 22,
    boxShadow: '0 14px 30px rgba(15, 23, 42, 0.06)',
    padding: 18,
    display: 'grid',
    gap: 12
  },
  input: {
    width: '100%',
    border: '1px solid #dbe3ee',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 14,
    boxSizing: 'border-box',
    background: '#f8fafc'
  },
  primaryButton: {
    marginTop: 4,
    border: 'none',
    background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
    color: '#fff',
    fontWeight: 800,
    borderRadius: 12,
    padding: '12px 16px',
    cursor: 'pointer',
    boxShadow: '0 12px 28px rgba(234, 88, 12, 0.28)'
  },
  resultCard: {
    background: 'linear-gradient(180deg, #0f172a 0%, #162134 100%)',
    color: '#fff',
    borderRadius: 22,
    padding: 20,
    boxShadow: '0 18px 36px rgba(15, 23, 42, 0.2)'
  },
  resultValue: { marginTop: 10, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 900 },
  resultNote: { marginTop: 8, color: 'rgba(255,255,255,0.75)', fontSize: 13 }
}
