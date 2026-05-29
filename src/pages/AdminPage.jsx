import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/app.css'

export default function AdminPage() {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const [activeSection, setActiveSection] = useState('riders')

    return (
        <div className="vp-page">

            <nav className="vp-navbar">
                <div className="vp-logo">N</div>
                <div className="vp-nav-links">
                    <a className="vp-nav-link" onClick={() => navigate('/overview')}>Overview</a>
                    <a className="vp-nav-link" onClick={() => navigate('/deliveries')}>Deliveries</a>
                    <a className="vp-nav-link" onClick={() => navigate('/patients')}>Patients</a>
                    <a className="vp-nav-link" onClick={() => navigate('/dispatchRiders')}>Dispatch Riders</a>
                    <a className="vp-nav-link active">Admin</a>
                </div>
                <div className="vp-user" onClick={() => { localStorage.removeItem('user'); navigate('/login') }}>
                    <div className="vp-avatar">{user.username?.[0]?.toUpperCase() || 'U'}</div>
                    <span>{user.username || 'User'}</span>
                    <span className="vp-chevron">&#9662;</span>
                </div>
            </nav>

            <div className="vp-body">

                {/* Sidebar */}
                <div className="vp-sidebar">
                    <p className="vp-sidebar-label">Manage</p>
                    <div className={`vp-sidebar-item ${activeSection === 'riders' ? 'active' : ''}`} onClick={() => setActiveSection('riders')}>
                        Dispatch Riders
                    </div>
                    <div className={`vp-sidebar-item ${activeSection === 'packages' ? 'active' : ''}`} onClick={() => setActiveSection('packages')}>
                        Packages
                    </div>
                </div>

                {/* Main */}
                <div className="vp-main" style={{ padding: 0 }}>
                    {activeSection === 'riders'   && <RidersAdmin />}
                    {activeSection === 'packages' && <PackagesAdmin />}
                </div>

            </div>
        </div>
    )
}

function RidersAdmin() {
    const [riders, setRiders] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ name: '', phone_number: '', area: '' })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    function load() {
        fetch('http://localhost:4000/api/riders').then(r => r.json()).then(setRiders).catch(() => {})
    }
    useEffect(() => { load() }, [])

    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.name || !form.phone_number || !form.area) { setError('All fields are required.'); return }
        setSaving(true); setError('')
        try {
            const res = await fetch('http://localhost:4000/api/riders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed to add rider.'); return }
            setShowModal(false)
            setForm({ name: '', phone_number: '', area: '' })
            load()
        } catch { setError('Failed to add rider.') }
        finally { setSaving(false) }
    }

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Dispatch Riders</h2>
                <button className="pat-add-btn" onClick={() => { setShowModal(true); setError('') }}>+ Add Rider</button>
            </div>

            <div className="vp-table-wrap">
                <table className="del-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone Number</th>
                            <th>Area</th>
                            <th>Deliveries</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {riders.length === 0 && <tr><td colSpan={5} className="del-empty">No riders found.</td></tr>}
                        {riders.map(r => (
                            <tr key={r.id}>
                                <td>{r.name}</td>
                                <td>{r.phone_number}</td>
                                <td>{r.area}</td>
                                <td>{r.number_of_deliveries}</td>
                                <td>{r.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="as-modal-overlay">
                    <div className="as-modal">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 className="as-modal-title" style={{ margin: 0 }}>Add Dispatch Rider</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9ca3af' }}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="vp-form">
                                <div className="vp-field full">
                                    <label>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Rider's full name" />
                                </div>
                                <div className="vp-field half">
                                    <label>Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} placeholder="e.g. 08012345678" />
                                </div>
                                <div className="vp-field half">
                                    <label>Delivery Area <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="e.g. Ikeja" />
                                </div>
                            </div>
                            {error && <p style={{ color: '#ef4444', fontSize: 13, margin: '8px 0' }}>{error}</p>}
                            <div className="as-modal-footer" style={{ marginTop: 20 }}>
                                <button type="button" className="as-submit-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="vp-save-btn" disabled={saving}>{saving ? 'Saving...' : 'Add Rider'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

function PackagesAdmin() {
    const [packages, setPackages] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ package_code: '', qr_code: '' })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    function load() {
        fetch('http://localhost:4000/api/packages').then(r => r.json()).then(setPackages).catch(() => {})
    }
    useEffect(() => { load() }, [])

    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.package_code || !form.qr_code) { setError('Both fields are required.'); return }
        setSaving(true); setError('')
        try {
            const res = await fetch('http://localhost:4000/api/packages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed to add package.'); return }
            setShowModal(false)
            setForm({ package_code: '', qr_code: '' })
            load()
        } catch { setError('Failed to add package.') }
        finally { setSaving(false) }
    }

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>
                    Packages
                    <span style={{ marginLeft: 10, fontSize: 12, color: '#6b7280', fontWeight: 400 }}>
                        {packages.filter(p => !p.scanned).length} available · {packages.filter(p => p.scanned).length} used
                    </span>
                </h2>
                <button className="pat-add-btn" onClick={() => { setShowModal(true); setError('') }}>+ Add Package</button>
            </div>

            <div className="vp-table-wrap">
                <table className="del-table">
                    <thead>
                        <tr>
                            <th>Package Code</th>
                            <th>QR Code Value</th>
                            <th>Status</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {packages.length === 0 && <tr><td colSpan={4} className="del-empty">No packages found.</td></tr>}
                        {packages.map(p => (
                            <tr key={p.id}>
                                <td>{p.package_code}</td>
                                <td>{p.qr_code}</td>
                                <td>
                                    <span className={`pat-badge ${p.scanned ? 'pat-badge-gray' : 'pat-badge-green'}`}>
                                        {p.scanned ? 'Used' : 'Available'}
                                    </span>
                                </td>
                                <td>{new Date(p.created_at).toLocaleDateString('en-GB')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="as-modal-overlay">
                    <div className="as-modal">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 className="as-modal-title" style={{ margin: 0 }}>Add Package</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9ca3af' }}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="vp-form">
                                <div className="vp-field full">
                                    <label>Package Code <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input value={form.package_code} onChange={e => setForm(f => ({ ...f, package_code: e.target.value }))} placeholder="e.g. PKG-002" />
                                </div>
                                <div className="vp-field full">
                                    <label>QR Code Value <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input value={form.qr_code} onChange={e => setForm(f => ({ ...f, qr_code: e.target.value }))} placeholder="Text encoded in the QR sticker" />
                                </div>
                            </div>
                            {error && <p style={{ color: '#ef4444', fontSize: 13, margin: '8px 0' }}>{error}</p>}
                            <div className="as-modal-footer" style={{ marginTop: 20 }}>
                                <button type="button" className="as-submit-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="vp-save-btn" disabled={saving}>{saving ? 'Saving...' : 'Add Package'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
