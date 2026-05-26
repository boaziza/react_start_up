import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/app.css'

export default function DeliveriesPage() {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    const [deliveries, setDeliveries] = useState([])
    const [activeFilter, setActiveFilter] = useState('Paid')
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetch('http://localhost:4000/api/deliveries')
            .then(res => {
                if (!res.ok) throw new Error('Deliveries not found')
                return res.json()
            })
            .then(data => setDeliveries(data))
            .catch(err => console.error('Failed to load deliveries:', err))
    }, [])

    // counts from real status column + payment_status
    const counts = {
        paid:       deliveries.filter(d => d.status === 'unassigned' && d.payment_status === true).length,
        unpaid:     deliveries.filter(d => d.status === 'unassigned' && d.payment_status === false).length,
        pending:    deliveries.filter(d => d.status === 'pending').length,
        successful: deliveries.filter(d => d.status === 'successful').length,
        failed:     deliveries.filter(d => d.status === 'failed').length,
    }

    const filtered = deliveries.filter(d => {
        const matchesFilter =
            activeFilter === 'Paid'       ? (d.status === 'unassigned' && d.payment_status === true)  :
            activeFilter === 'Unpaid'     ? (d.status === 'unassigned' && d.payment_status === false) :
            activeFilter === 'Pending'    ? d.status === 'pending'    :
            activeFilter === 'Successful' ? d.status === 'successful' :
            activeFilter === 'Failed'     ? d.status === 'failed'     : true

        const matchesSearch =
            d.package_code?.toLowerCase().includes(search.toLowerCase()) ||
            d.patient_name?.toLowerCase().includes(search.toLowerCase())

        return matchesFilter && matchesSearch
    })

    return (
        <div className="vp-page">

            {/* Navbar */}
            <nav className="vp-navbar">
                <div className="vp-logo">N</div>

                <div className="vp-nav-links">
                    <a className="vp-nav-link" onClick={() => navigate('/overview')}>Overview</a>
                    <a className="vp-nav-link active">Deliveries</a>
                    <a className="vp-nav-link" onClick={() => navigate('/patients')}>Patients</a>
                    <a className="vp-nav-link" onClick={() => navigate('/dispatchRiders')}>Dispatch Riders</a>
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
                <div className="del-sort">
                    <span>Sort by</span>
                    <select>
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
                        value={search}
                        onChange={e => setSearch(e.target.value)}
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
                        {counts.paid > 0 && <span className="del-badge del-badge-blue">{counts.paid}</span>}
                    </div>

                    <div
                        className={`del-sidebar-item ${activeFilter === 'Unpaid' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('Unpaid')}
                    >
                        <span>Unpaid</span>
                        {counts.unpaid > 0 && <span className="del-badge del-badge-red">{counts.unpaid}</span>}
                    </div>

                    <p className="del-sidebar-group">Assigned Deliveries</p>

                    <div
                        className={`del-sidebar-item ${activeFilter === 'Pending' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('Pending')}
                    >
                        <span>Pending</span>
                        {counts.pending > 0 && <span className="del-badge del-badge-blue">{counts.pending}</span>}
                    </div>

                    <div
                        className={`del-sidebar-item ${activeFilter === 'Successful' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('Successful')}
                    >
                        <span>Successful</span>
                        {counts.successful > 0 && <span className="del-badge del-badge-blue">{counts.successful}</span>}
                    </div>

                    <div
                        className={`del-sidebar-item ${activeFilter === 'Failed' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('Failed')}
                    >
                        <span>Failed</span>
                        {counts.failed > 0 && <span className="del-badge del-badge-red">{counts.failed}</span>}
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
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="del-empty">
                                        No deliveries found.
                                    </td>
                                </tr>
                            )}
                            {filtered.map(d => (
                                <tr key={d.id}>
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
