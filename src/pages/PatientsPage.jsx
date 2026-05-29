import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/app.css'

const emptyForm = {
    hospital_id: '',
    name: '',
    phone_number: '',
    gender: 'Male',
    email: '',
    location: '',
    address: '',
    default_drug_period: '30',
    next_delivery_date: '',
}

export default function PatientsPage() {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('hospital_id')
    const [page, setPage] = useState(1)
    const perPage = 10

    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState('')
    const [refreshKey, setRefreshKey] = useState(0)

    function handleChange(e) {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    }

    function openModal() {
        setForm(emptyForm)
        setFormError('')
        setShowModal(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.hospital_id || !form.name || !form.phone_number) {
            setFormError('Hospital ID, Name and Phone Number are required.')
            return
        }
        setSaving(true)
        setFormError('')
        try {
            const res = await fetch('http://localhost:4000/api/patient', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    default_drug_period: Number(form.default_drug_period) || 30,
                    next_delivery_date: form.next_delivery_date || null,
                }),
            })
            if (!res.ok) {
                const data = await res.json()
                setFormError(data.error || 'Failed to add patient.')
                return
            }
            setShowModal(false)
            setRefreshKey(k => k + 1)
        } catch {
            setFormError('Failed to add patient. Try again.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="vp-page">

            {/* Navbar */}
            <nav className="vp-navbar">
                <div className="vp-logo">N</div>
                <div className="vp-nav-links">
                    <a className="vp-nav-link" onClick={() => navigate('/overview')}>Overview</a>
                    <a className="vp-nav-link" onClick={() => navigate('/deliveries')}>Deliveries</a>
                    <a className="vp-nav-link active">Patients</a>
                    <a className="vp-nav-link" onClick={() => navigate('/dispatchRiders')}>Dispatch Riders</a>
                    <a className="vp-nav-link" onClick={() => navigate('/admin')}>Admin</a>
                </div>
                <div className="vp-user" onClick={() => { localStorage.removeItem('user'); navigate('/login') }}>
                    <div className="vp-avatar">{user.username?.[0]?.toUpperCase() || 'U'}</div>
                    <span>{user.username || 'User'}</span>
                    <span className="vp-chevron">&#9662;</span>
                </div>
            </nav>

            {/* Page content */}
            <div className="pat-content">

                <div className="pat-page-header">
                    <h1 className="pat-title">Patients</h1>
                    <button className="pat-add-btn" onClick={openModal}>+ Add Patient</button>
                </div>

                <div className="pat-card">
                    <div className="del-toolbar">
                        <div className="del-sort">
                            <span>Sort by</span>
                            <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1) }}>
                                <option value="hospital_id">Hospital ID</option>
                                <option value="name">Name</option>
                            </select>
                        </div>
                        <div className="del-search-wrapper">
                            <span className="del-search-icon">&#128269;</span>
                            <input
                                className="del-search"
                                placeholder="Search by patient name, id..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1) }}
                            />
                        </div>
                    </div>

                    <PatientTable
                        search={search}
                        sortBy={sortBy}
                        page={page}
                        setPage={setPage}
                        perPage={perPage}
                        refreshKey={refreshKey}
                    />
                </div>
            </div>

            {/* Add Patient Modal */}
            {showModal && (
                <div className="as-modal-overlay">
                    <div className="as-modal" style={{ width: 520, maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 className="as-modal-title" style={{ margin: 0 }}>Add New Patient</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9ca3af' }}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="vp-form">

                                <div className="vp-field full">
                                    <label>Hospital ID <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input name="hospital_id" value={form.hospital_id} onChange={handleChange} placeholder="e.g. LUTH-001" />
                                </div>

                                <div className="vp-field full">
                                    <label>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input name="name" value={form.name} onChange={handleChange} placeholder="Patient's full name" />
                                </div>

                                <div className="vp-field half">
                                    <label>Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="e.g. 08012345678" />
                                </div>

                                <div className="vp-field half">
                                    <label>Gender</label>
                                    <select name="gender" value={form.gender} onChange={handleChange}>
                                        <option>Male</option>
                                        <option>Female</option>
                                    </select>
                                </div>

                                <div className="vp-field full">
                                    <label>Email Address</label>
                                    <input name="email" value={form.email} onChange={handleChange} placeholder="patient@email.com" />
                                </div>

                                <div className="vp-field half">
                                    <label>Delivery Area</label>
                                    <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Ikeja" />
                                </div>

                                <div className="vp-field half">
                                    <label>Delivery Address</label>
                                    <input name="address" value={form.address} onChange={handleChange} placeholder="Full address" />
                                </div>

                                <div className="vp-field half">
                                    <label>Default Drug Period (days)</label>
                                    <input type="number" name="default_drug_period" value={form.default_drug_period} onChange={handleChange} placeholder="30" />
                                </div>

                                <div className="vp-field half">
                                    <label>Next Delivery Date</label>
                                    <input type="date" name="next_delivery_date" value={form.next_delivery_date} onChange={handleChange} />
                                </div>

                            </div>

                            {formError && <p style={{ color: '#ef4444', fontSize: 13, margin: '8px 0' }}>{formError}</p>}

                            <div className="as-modal-footer" style={{ marginTop: 20 }}>
                                <button type="button" className="as-submit-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="vp-save-btn" disabled={saving}>
                                    {saving ? 'Saving...' : 'Add Patient'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

function PatientTable({ search, sortBy, page, setPage, perPage, refreshKey }) {
    const navigate = useNavigate()
    const [patients, setPatients] = useState([])

    useEffect(() => {
        fetch('http://localhost:4000/api/patient')
            .then(res => res.json())
            .then(data => setPatients(data))
            .catch(err => console.error('Failed to fetch patients:', err))
    }, [refreshKey])

    const filtered = patients
        .filter(p =>
            p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.hospital_id?.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'name') return a.name?.localeCompare(b.name)
            if (sortBy === 'hospital_id') return a.hospital_id?.localeCompare(b.hospital_id)
            return 0
        })

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
    const paginated = filtered.slice((page - 1) * perPage, page * perPage)

    return (
        <>
            <div className="vp-table-wrap">
            <table className="del-table">
                <thead>
                    <tr>
                        <th>Hospital ID</th>
                        <th>Patient's Name</th>
                        <th>Phone Number</th>
                        <th>Next Delivery Date</th>
                        <th>Location</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {paginated.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="del-empty">No patients found.</td>
                        </tr>
                    ) : (
                        paginated.map(patient => (
                            <tr key={patient.id}>
                                <td>{patient.hospital_id}</td>
                                <td>{patient.name}</td>
                                <td>{patient.phone_number}</td>
                                <td>{patient.next_delivery_date
                                    ? new Date(patient.next_delivery_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                                    : '—'}
                                </td>
                                <td>{patient.location || '—'}</td>
                                <td>
                                    <button
                                        className="del-view-btn"
                                        onClick={() => navigate(`/patients/ViewPatient/${patient.id}`)}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            </div>

            <div className="pat-pagination">
                <span className="pat-pagination-info">
                    Showing {paginated.length} of {filtered.length} patients
                </span>
                <div className="pat-pagination-controls">
                    <button className="pat-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                        <button key={n} className={`pat-page-btn ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                    ))}
                    <button className="pat-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
                </div>
            </div>
        </>
    )
}
