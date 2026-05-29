import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/app.css'

export default function RidersPage() {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const [riders, setRiders] = useState([])
    const [search, setSearch] = useState('')
    const [selectedRider, setSelectedRider] = useState(null)
    const [panelData, setPanelData] = useState(null)
    const [panelLoading, setPanelLoading] = useState(false)

    useEffect(() => {
        fetch('http://localhost:4000/api/riders')
            .then(res => { if (!res.ok) throw new Error(); return res.json() })
            .then(data => setRiders(data))
            .catch(err => console.error('Failed to load riders:', err))
    }, [])

    function openPanel(rider) {
        setSelectedRider(rider.id)
        setPanelLoading(true)
        fetch(`http://localhost:4000/api/riders/${rider.id}`)
            .then(res => res.json())
            .then(data => setPanelData(data))
            .catch(err => console.error(err))
            .finally(() => setPanelLoading(false))
    }

    function closePanel() {
        setSelectedRider(null)
        setPanelData(null)
    }

    const filtered = riders.filter(r =>
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.area?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="vp-page">

            {/* Navbar */}
            <nav className="vp-navbar">
                <div className="vp-logo">N</div>
                <div className="vp-nav-links">
                    <a className="vp-nav-link" onClick={() => navigate('/overview')}>Overview</a>
                    <a className="vp-nav-link" onClick={() => navigate('/deliveries')}>Deliveries</a>
                    <a className="vp-nav-link" onClick={() => navigate('/patients')}>Patients</a>
                    <a className="vp-nav-link active">Dispatch Riders</a>
                    <a className="vp-nav-link" onClick={() => navigate('/admin')}>Admin</a>
                </div>
                <div className="vp-user" onClick={() => { localStorage.removeItem('user'); navigate('/login') }}>
                    <div className="vp-avatar">{user.username?.[0]?.toUpperCase() || 'U'}</div>
                    <span>{user.username || 'User'}</span>
                    <span className="vp-chevron">&#9662;</span>
                </div>
            </nav>

            {/* Toolbar */}
            <div className="del-toolbar">
                <div className="del-sort" />
                <div className="del-search-wrapper">
                    <span className="del-search-icon">&#128269;</span>
                    <input
                        className="del-search"
                        placeholder="Search by name or area"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Body */}
            <div className="vp-body" style={{ position: 'relative' }}>

                {/* Table */}
                <div className="vp-main" style={{ padding: 0 }}>
                    <div className="vp-table-wrap">
                    <table className="del-table">
                        <thead>
                            <tr>
                                <th>Rider's Name</th>
                                <th>Phone Number</th>
                                <th>Area</th>
                                <th>Deliveries</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && (
                                <tr><td colSpan={6} className="del-empty">No riders found.</td></tr>
                            )}
                            {filtered.map(r => (
                                <tr key={r.id} className={selectedRider === r.id ? 'rider-row-active' : ''}>
                                    <td>{r.name}</td>
                                    <td>{r.phone_number}</td>
                                    <td>{r.area}</td>
                                    <td>{r.delivery_count}</td>
                                    <td>{r.status}</td>
                                    <td>
                                        <button className="del-view-btn" onClick={() => openPanel(r)}>
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>

                {/* Side panel */}
                {selectedRider && (
                    <div className="rider-panel">
                        <div className="rider-panel-header">
                            <h3 className="rider-panel-title">{panelData?.name || 'Rider'}</h3>
                            <button className="rider-panel-close" onClick={closePanel}>✕</button>
                        </div>

                        {panelLoading ? (
                            <p style={{ padding: 20, color: '#9ca3af' }}>Loading...</p>
                        ) : panelData && (
                            <>
                                <div className="rider-panel-info">
                                    <div className="rider-panel-row">
                                        <span className="rider-panel-label">Phone</span>
                                        <span>{panelData.phone_number}</span>
                                    </div>
                                    <div className="rider-panel-row">
                                        <span className="rider-panel-label">Area</span>
                                        <span>{panelData.area}</span>
                                    </div>
                                    <div className="rider-panel-row">
                                        <span className="rider-panel-label">Status</span>
                                        <span>{panelData.status}</span>
                                    </div>
                                </div>

                                <p className="rider-panel-section">Assigned Deliveries</p>

                                {panelData.deliveries.length === 0 ? (
                                    <p style={{ padding: '0 16px', color: '#9ca3af', fontSize: 13 }}>No deliveries assigned.</p>
                                ) : (
                                    <div className="rider-panel-deliveries">
                                        {panelData.deliveries.map(d => (
                                            <div key={d.id} className="rider-panel-delivery-card">
                                                <div>
                                                    <span className="rider-panel-label">Patient</span>
                                                    <p style={{ margin: '2px 0', fontSize: 14, fontWeight: 600 }}>{d.patient_name}</p>
                                                </div>
                                                <div>
                                                    <span className="rider-panel-label">Package</span>
                                                    <p style={{ margin: '2px 0', fontSize: 13 }}>{d.package_code}</p>
                                                </div>
                                                <div>
                                                    <span className="rider-panel-label">Status</span>
                                                    <p style={{ margin: '2px 0', fontSize: 13 }}>{d.status}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
