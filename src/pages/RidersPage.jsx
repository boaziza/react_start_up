import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/app.css'

export default function RidersPage() {
    const navigate = useNavigate()

    const [riders, setRiders] = useState([])
    const [activeFilter, setActiveFilter] = useState('Successful')
    const [sortBy, setSortBy]             = useState('Most Recent')
    // ─────────────────────────────────────────────────────────────────────

    useEffect(() => {
        fetch('http://localhost:4000/api/riders')
            .then(res => {
                if (!res.ok) throw new Error('Riders not found')
                return res.json()
            })
            .then(data => { setRiders(data) })
            .catch(err => console.error('Failed to load riders:', err))
    }, [])

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

                <div className="vp-user">
                    <div className="vp-avatar">E</div>
                    <span>Emmanuel Adigwe</span>
                    <span className="vp-chevron">&#9662;</span>
                </div>
            </nav>

            {/* Toolbar */}
            <div className="del-toolbar">
                <div className="del-sort">
                </div>
                <div className="del-search-wrapper">
                    <input
                        className="del-search"
                        placeholder="Search Rider"
                    />
                </div>
            </div>

            {/* Body */}
            <div className="vp-body">
                
                {/* Main table */}
                <div className="vp-main" style={{ padding: 0, overflow: 'hidden' }}>
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
                            {riders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="del-empty">
                                        No riders found.
                                    </td>
                                </tr>
                            )}
                            {riders.map(r => (
                                <tr key={r.id}>
                                    {/* ── Replace field names to match your backend columns ── */}
                                    <td>{r.name}</td>
                                    <td>{r.phone_number}</td>
                                    <td>{r.area}</td>
                                    <td>{r.number_of_deliveries}</td>
                                    <td>{r.status}</td>
                                    <td>
                                        <button
                                            className="del-view-btn"
                                            onClick={() => navigate(`/deliveries/${r.id}`)}
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
