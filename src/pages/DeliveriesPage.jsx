import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/app.css'

export default function DeliveriesPage() {
    const navigate = useNavigate()

    const [deliveries, setDeliveries] = useState([])
    const [activeFilter, setActiveFilter] = useState('Successful')
    const [sortBy, setSortBy]             = useState('Most Recent')

    // ── Sidebar counts: replace each value with counts from your backend ──
    const counts = {
        paid:       12,   // e.g. data.filter(d => d.payment_status === 'paid').length
        unpaid:     8,    // e.g. data.filter(d => d.payment_status === 'unpaid').length
        pending:    0,
        successful: 0,
        failed:     12,
    }
    // ─────────────────────────────────────────────────────────────────────

    useEffect(() => {
        fetch('http://localhost:4000/api/deliveries')
            .then(res => {
                if (!res.ok) throw new Error('Deliveries not found')
                return res.json()
            })
            .then(data => { setDeliveries(data) })
            .catch(err => console.error('Failed to load deliveries:', err))
    }, [])

    return (
        <div className="vp-page">

            {/* Navbar */}
            <nav className="vp-navbar">
                <div className="vp-logo">N</div>

                <div className="vp-nav-links">
                    <a className="vp-nav-link" onClick={() => navigate('/overview')}>Overview</a>
                    <a className="vp-nav-link active">Deliveries</a>
                    <a className="vp-nav-link" onClick={() => navigate('/patients')}>Patients</a>
                    <a className="vp-nav-link" onClick={() => navigate('/DispatchRiders')}>Dispatch Riders</a>
                    <a className="vp-nav-link" onClick={() => navigate('/admin')}>Admin</a>
                </div>

                <div className="vp-user">
                    <div className="vp-avatar">E</div>
                    <span>Emmanuel Adigwe</span>
                    <span className="vp-chevron">&#9662;</span>
                </div>
            </nav>

            {/* Toolbar */}
            <div className="del-toolbar">
                <div className="del-sort">
                    <span>Sort by</span>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                        <option>Most Recent</option>
                        <option>Oldest</option>
                        <option>Patient Name</option>
                    </select>
                </div>
                <div className="del-search-wrapper">
                    <span className="del-search-icon">&#128269;</span>
                    <input
                        className="del-search"
                        placeholder="Search by package code"
                    />
                </div>
            </div>

            {/* Body */}
            <div className="vp-body">

                {/* Sidebar */}
                <div className="vp-sidebar">

                    <p className="del-sidebar-group">Unassigned Deliveries</p>

                    <div
                        className={`del-sidebar-item ${activeFilter === 'Paid' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('Paid')}
                    >
                        <span>Paid</span>
                        <span className="del-badge del-badge-blue">{counts.paid}</span>
                    </div>

                    <div
                        className={`del-sidebar-item ${activeFilter === 'Unpaid' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('Unpaid')}
                    >
                        <span>Unpaid</span>
                        <span className="del-badge del-badge-red">{counts.unpaid}</span>
                    </div>

                    <p className="del-sidebar-group">Assigned Deliveries</p>

                    <div
                        className={`del-sidebar-item ${activeFilter === 'Pending' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('Pending')}
                    >
                        <span>Pending</span>
                    </div>

                    <div
                        className={`del-sidebar-item ${activeFilter === 'Successful' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('Successful')}
                    >
                        <span>Successful</span>
                    </div>

                    <div
                        className={`del-sidebar-item ${activeFilter === 'Failed' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('Failed')}
                    >
                        <span>Failed</span>
                        <span className="del-badge del-badge-red">{counts.failed}</span>
                    </div>

                </div>

                {/* Main table */}
                <div className="vp-main" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="del-table">
                        <thead>
                            <tr>
                                <th>Package Code</th>
                                <th>Delivery Date</th>
                                <th>Patient's Name</th>
                                <th>Phone Number</th>
                                <th>Location</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveries.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="del-empty">
                                        No deliveries found.
                                    </td>
                                </tr>
                            )}
                            {deliveries.map(d => (
                                <tr key={d.id}>
                                    {/* ── Replace field names to match your backend columns ── */}
                                    <td>{d.package_code}</td>
                                    <td>{d.date}</td>
                                    <td>{d.patient_name}</td>
                                    <td>{d.phone_number}</td>
                                    <td>{d.location}</td>
                                    <td>
                                        <button
                                            className="del-view-btn"
                                            onClick={() => navigate(`/deliveries/${d.id}`)}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    )
}
