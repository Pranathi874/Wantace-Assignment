import React, { useEffect, useState } from 'react'

function useAuth() {
  const [auth, setAuth] = useState(() => window.localStorage.getItem('owner_auth') || '')
  const [status, setStatus] = useState('')

  const persistRememberedLogin = (user, pass, remember) => {
    if (remember) {
      window.localStorage.setItem('owner_credentials', JSON.stringify({ user, pass }))
    } else {
      window.localStorage.removeItem('owner_credentials')
    }
  }

  const login = async (user, pass, remember = false) => {
    setStatus('')
    try {
      const response = await fetch('https://wantace-server.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Invalid credentials' }))
        throw new Error(data.error || 'Invalid credentials')
      }

      const basic = btoa(`${user}:${pass}`)
      window.localStorage.setItem('owner_auth', basic)
      persistRememberedLogin(user, pass, remember)
      setAuth(basic)
      return true
    } catch (error) {
      setStatus(error.message || 'Login failed')
      return false
    }
  }

  const logout = () => {
    window.localStorage.removeItem('owner_auth')
    window.localStorage.removeItem('owner_credentials')
    setAuth('')
    setStatus('')
  }

  useEffect(() => {
    const saved = window.localStorage.getItem('owner_credentials')
    if (!saved || auth) return

    try {
      const { user, pass } = JSON.parse(saved)
      if (user && pass) {
        login(user, pass, true)
      }
    } catch (error) {
      window.localStorage.removeItem('owner_credentials')
    }
  }, [auth])

  return { auth, status, login, logout }
}

function LeadDetailDrawer({ lead, onClose }) {
  if (!lead) return null

  return (
    <div style={styles.drawerOverlay} onClick={onClose}>
      <aside style={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div style={styles.drawerHeader}>
          <div>
            <p style={styles.kicker}>Lead details</p>
            <h3 style={styles.h3}>{lead.name}</h3>
          </div>
          <button onClick={onClose} style={styles.closeButton}>Close</button>
        </div>

        <div style={styles.detailGrid}>
          <div style={styles.detailItem}><span>Email</span><strong>{lead.email || '—'}</strong></div>
          <div style={styles.detailItem}><span>Phone</span><strong>{lead.phone || '—'}</strong></div>
          <div style={styles.detailItem}><span>Estimate low</span><strong>${Number(lead.estimateLow || 0).toLocaleString()}</strong></div>
          <div style={styles.detailItem}><span>Estimate high</span><strong>${Number(lead.estimateHigh || 0).toLocaleString()}</strong></div>
          <div style={styles.detailItem}><span>Config version</span><strong>{lead.configVersion}</strong></div>
          <div style={styles.detailItem}><span>Created</span><strong>{new Date(lead.createdAt).toLocaleString()}</strong></div>
        </div>

        <div style={styles.answersCard}>
          <h4 style={{ margin: '0 0 10px' }}>Answers</h4>
          <pre style={styles.pre}>{JSON.stringify(lead.answers || {}, null, 2)}</pre>
        </div>
      </aside>
    </div>
  )
}

function LeadsTable({ auth }) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState(null)

  useEffect(() => {
    if (!auth) return

    setLoading(true)
    fetch('https://wantace-server.onrender.com/api/admin/leads', {
  headers: { Authorization: 'Basic ' + auth }
})
      .then((r) => r.json())
      .then((d) => setLeads(d.leads || []))
      .finally(() => setLoading(false))
  }, [auth])

  const totalRevenue = leads.reduce((sum, lead) => sum + Number(lead.estimateHigh || 0), 0)
  const avgRevenue = leads.length ? totalRevenue / leads.length : 0

  return (
    <>
      <section style={styles.panel}>
        <div style={styles.sectionHeader}>
          <div>
            <p style={styles.kicker}>Leads</p>
            <h3 style={styles.h3}>Captured Leads</h3>
          </div>
          <div style={styles.statsRow}>
            <div style={styles.miniStat}>
              <span>Total</span>
              <strong>{leads.length}</strong>
            </div>
            <div style={styles.miniStat}>
              <span>Avg value</span>
              <strong>${Math.round(avgRevenue).toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={styles.emptyState}>Loading leads...</div>
        ) : leads.length === 0 ? (
          <div style={styles.emptyState}>No leads captured yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Estimate</th>
                  <th style={styles.th}>Created</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    style={styles.tr}
                    onClick={() => setSelectedLead(lead)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8fafc'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fff'
                    }}
                    title="Open lead details"
                  >
                    <td style={styles.td}>{lead.name}</td>
                    <td style={styles.td}>{lead.email || '—'}</td>
                    <td style={styles.td}>{lead.phone || '—'}</td>
                    <td style={styles.td}>
                      ${Number(lead.estimateLow || 0).toLocaleString()} - ${Number(lead.estimateHigh || 0).toLocaleString()}
                    </td>
                    <td style={styles.td}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <LeadDetailDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </>
  )
}

function ConfigEditor({ auth }) {
  const [config, setConfig] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    fetch('https://wantace-server.onrender.com/api/config')
      .then((r) => r.json())
      .then((data) => setConfig(data))
  }, [])

  const updateQuestion = (idx, patch) => {
    const copy = JSON.parse(JSON.stringify(config))
    copy.questions[idx] = { ...copy.questions[idx], ...patch }
    setConfig(copy)
  }

  const save = async () => {
    setSaving(true)
    setSaveMessage('')

    try {
      const payload = {
        business: {
          name: config.business?.name || 'Northline Roofing & Exteriors',
          currency: config.business?.currency || 'USD'
        },
        questions: config.questions,
        modifiers: config.modifiers
      }

      const response = await fetch('https://wantace-server.onrender.com/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + auth
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Save failed')
      setSaveMessage('Config saved successfully.')
    } catch (error) {
      setSaveMessage('Unable to save config right now.')
    } finally {
      setSaving(false)
    }
  }

  if (!config) return <section style={styles.panel}>Loading config...</section>

  return (
    <section style={styles.panel}>
      <div style={styles.sectionHeader}>
        <div>
          <p style={styles.kicker}>Settings</p>
          <h3 style={styles.h3}>Configuration Editor</h3>
        </div>
        <button onClick={save} disabled={saving} style={styles.primaryButton}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saveMessage && <div style={styles.saveMessage}>{saveMessage}</div>}

      <div style={styles.configCard}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={styles.label}>Business name</label>
            <input
              value={config.business?.name || ''}
              onChange={(e) => setConfig({ ...config, business: { ...config.business, name: e.target.value } })}
              style={styles.input}
            />
          </div>
          <div style={{ width: 180 }}>
            <label style={styles.label}>Currency</label>
            <select
              value={config.business?.currency || 'USD'}
              onChange={(e) => setConfig({ ...config, business: { ...config.business, currency: e.target.value } })}
              style={styles.input}
            >
              <option value="USD">USD (US Dollar)</option>
              <option value="INR">INR (Indian Rupee)</option>
            </select>
          </div>
        </div>

        {config.questions.map((question, idx) => (
          <div key={question.key} style={styles.questionBlock}>
            <div style={styles.questionHeader}>
              <div>
                <strong>{question.label}</strong>
                <div style={styles.labelSmall}>{question.key}</div>
              </div>
              <label style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={!!question.active}
                  onChange={(e) => updateQuestion(idx, { active: e.target.checked })}
                />
                <span>Active</span>
              </label>
            </div>

            {question.type === 'select' && question.options?.map((option, optionIndex) => (
              <div key={option.value} style={styles.optionCard}>
                <div style={styles.optionTitle}>{option.label}</div>
                <div style={styles.optionFields}>
                  {option.rate_per_sqft !== undefined && (
                    <label style={styles.inlineField}>
                      <span>Rate / sqft</span>
                      <input
                        type="number"
                        step="0.01"
                        value={option.rate_per_sqft}
                        onChange={(e) => {
                          const copy = JSON.parse(JSON.stringify(config))
                          copy.questions[idx].options[optionIndex].rate_per_sqft = Number(e.target.value)
                          setConfig(copy)
                        }}
                        style={styles.input}
                      />
                    </label>
                  )}

                  {option.multiplier !== undefined && (
                    <label style={styles.inlineField}>
                      <span>Multiplier</span>
                      <input
                        type="number"
                        step="0.01"
                        value={option.multiplier}
                        onChange={(e) => {
                          const copy = JSON.parse(JSON.stringify(config))
                          copy.questions[idx].options[optionIndex].multiplier = Number(e.target.value)
                          setConfig(copy)
                        }}
                        style={styles.input}
                      />
                    </label>
                  )}

                  {option.tear_off_per_sqft !== undefined && (
                    <label style={styles.inlineField}>
                      <span>Tear-off / sqft</span>
                      <input
                        type="number"
                        step="0.01"
                        value={option.tear_off_per_sqft}
                        onChange={(e) => {
                          const copy = JSON.parse(JSON.stringify(config))
                          copy.questions[idx].options[optionIndex].tear_off_per_sqft = Number(e.target.value)
                          setConfig(copy)
                        }}
                        style={styles.input}
                      />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Owner() {
  const { auth, status, login, logout } = useAuth()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleLogin = async () => {
    setSubmitting(true)
    const ok = await login(user, pass, rememberMe)
    setSubmitting(false)
    if (!ok) setPass('')
  }

  return (
    <div style={styles.root}>
      <div style={styles.topStats}>
        <div style={styles.statsCard}>
          <p style={styles.kicker}>Overview</p>
          <div style={styles.statsLabel}>Admin Dashboard</div>
        </div>
        <div style={styles.statsCard}>
          <span style={styles.metricLabel}>Active config</span>
          <strong style={styles.metricValue}>v3</strong>
        </div>
        <div style={styles.statsCard}>
          <span style={styles.metricLabel}>Avg estimate</span>
          <strong style={styles.metricValue}>$18.2k</strong>
        </div>
        <div style={styles.statsCard}>
          <span style={styles.metricLabel}>Today</span>
          <strong style={styles.metricValue}>12 leads</strong>
        </div>
      </div>

      <div style={styles.pageHeader}>
        <div>
          <p style={styles.kicker}>Admin</p>
          <h2 style={styles.h2}>Owner Panel</h2>
        </div>
        {auth && (
          <button onClick={logout} style={styles.secondaryButton}>
            Logout
          </button>
        )}
      </div>

      {!auth ? (
        <div style={styles.loginCard}>
          <div style={styles.loginHeader}>Sign in</div>
          <label style={styles.label}>Username</label>
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="admin"
            style={styles.input}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <label style={styles.label}>Password</label>
            <label style={{ ...styles.checkboxRow, margin: 0 }}>
              <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
              <span>Show</span>
            </label>
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="••••••••"
            style={styles.input}
          />

          <label style={styles.checkboxRow}>
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            <span>Remember me</span>
          </label>

          {status && <div style={styles.errorBox}>{status}</div>}

          <button onClick={handleLogin} disabled={submitting} style={styles.primaryButton}>
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 24 }}>
          <ConfigEditor auth={auth} />
          <LeadsTable auth={auth} />
        </div>
      )}
    </div>
  )
}

const styles = {
  root: { display: 'grid', gap: 24 },
  topStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: 16
  },
  statsCard: {
    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    color: '#fff',
    borderRadius: 16,
    padding: '18px 20px',
    boxShadow: '0 18px 26px rgba(15, 23, 42, 0.15)',
    display: 'grid',
    gap: 8
  },
  statsLabel: { fontSize: 20, fontWeight: 700 },
  metricLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8 },
  metricValue: { fontSize: 24 },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap'
  },
  h2: { margin: 0, fontSize: 30 },
  h3: { margin: 0, fontSize: 20 },
  kicker: { margin: 0, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64748b' },
  loginCard: {
    maxWidth: 460,
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 18,
    boxShadow: '0 16px 40px rgba(15, 23, 42, 0.06)',
    padding: 24,
    display: 'grid',
    gap: 12
  },
  loginHeader: { fontSize: 22, fontWeight: 700, marginBottom: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#334155' },
  input: {
    width: '100%',
    border: '1px solid #dbe3ee',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 14,
    boxSizing: 'border-box',
    background: '#f8fafc'
  },
  primaryButton: {
    marginTop: 6,
    border: 'none',
    background: 'linear-gradient(135deg, #0f172a, #1e293b)',
    color: '#fff',
    borderRadius: 10,
    padding: '11px 16px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  secondaryButton: {
    border: '1px solid #d5dce6',
    background: '#fff',
    color: '#0f172a',
    borderRadius: 10,
    padding: '8px 12px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  errorBox: {
    background: '#fff1f2',
    color: '#be123c',
    border: '1px solid #fecdd3',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 13
  },
  panel: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 18,
    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.04)',
    padding: 22
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 18
  },
  statsRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  miniStat: {
    display: 'grid',
    minWidth: 110,
    padding: '8px 10px',
    borderRadius: 10,
    background: '#f8fafc',
    border: '1px solid #edf2f7',
    gap: 3
  },
  configCard: { display: 'grid', gap: 18 },
  questionBlock: {
    padding: 16,
    border: '1px solid #edf2f7',
    borderRadius: 12,
    background: '#f8fafc'
  },
  questionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
    flexWrap: 'wrap'
  },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' },
  labelSmall: { color: '#64748b', fontSize: 12 },
  optionCard: {
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    background: '#fff',
    padding: 12,
    marginTop: 10
  },
  optionTitle: { fontWeight: 600, marginBottom: 10 },
  optionFields: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  inlineField: { display: 'grid', gap: 6, minWidth: 150, color: '#334155', fontSize: 12 },
  saveMessage: {
    marginBottom: 12,
    background: '#ecfeff',
    color: '#0f766e',
    border: '1px solid #a7f3d0',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 13
  },
  emptyState: {
    background: '#f8fafc',
    color: '#64748b',
    border: '1px dashed #cbd5e1',
    borderRadius: 12,
    padding: 20,
    textAlign: 'center'
  },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 700 },
  th: { textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569', padding: '10px 12px', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '12px', borderBottom: '1px solid #eef2f7', color: '#0f172a' },
  tr: { background: '#fff', cursor: 'pointer' },
  drawerOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 50
  },
  drawer: {
    width: 'min(520px, 92vw)',
    height: '100%',
    background: '#fff',
    boxShadow: '-20px 0 40px rgba(15, 23, 42, 0.12)',
    padding: 24,
    overflowY: 'auto'
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18
  },
  closeButton: {
    border: '1px solid #dbe3ee',
    background: '#f8fafc',
    borderRadius: 10,
    padding: '8px 10px',
    cursor: 'pointer'
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
    marginBottom: 18
  },
  detailItem: {
    display: 'grid',
    gap: 6,
    padding: 12,
    background: '#f8fafc',
    border: '1px solid #edf2f7',
    borderRadius: 12,
    fontSize: 13,
    color: '#475569'
  },
  answersCard: {
    border: '1px solid #edf2f7',
    background: '#f8fafc',
    borderRadius: 12,
    padding: 14
  },
  pre: {
    background: '#fff',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    padding: 12,
    overflowX: 'auto',
    margin: 0,
    fontSize: 12,
    color: '#0f172a'
  }
}
