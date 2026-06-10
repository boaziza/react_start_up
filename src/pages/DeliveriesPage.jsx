import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/app.css'
import Navbar from '../components/Navbar'

export default function DeliveriesPage() {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    useEffect(() => {
        document.title = 'Deliveries'
    }, [])

    const [deliveries, setDeliveries] = useState([])
    const [activeFilter, setActiveFilter] = useState('Dispatched')
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

    const counts = {
        dispatched: deliveries.filter(d => d.status === 'dispatched').length,
        successful: deliveries.filter(d => d.status === 'successful').length,
        failed:     deliveries.filter(d => d.status === 'failed').length,
    }

    const filtered = deliveries.filter(d => {
        const matchesFilter =
            activeFilter === 'Dispatched' ? d.status === 'dispatched' :
            activeFilter === 'Successful' ? d.status === 'successful' :
            activeFilter === 'Failed'     ? d.status === 'failed'     : true

        const matchesSearch =
            d.package_code?.toLowerCase().includes(search.toLowerCase()) ||
            d.patient_name?.toLowerCase().includes(search.toLowerCase())

        return matchesFilter && matchesSearch
    })

    return (
        <div className="vp-page">

            <Navbar active="Deliveries" />

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
                        placeholder="Search by package code or patient"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Body */}
            <div className="vp-body">

                {/* Sidebar */}
                <div className="vp-sidebar">

                    <p className="del-sidebar-group">Deliveries</p>

                    <div
                        className={`del-sidebar-item ${activeFilter === 'Dispatched' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('Dispatched')}
                    >
                        <span>Dispatched</span>
                        {counts.dispatched > 0 && <span className="del-badge del-badge-blue">{counts.dispatched}</span>}
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
                <div className="vp-main" style={{ padding: 0 }}>
                    <div className="vp-table-wrap">
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
        </div>
    )
}
