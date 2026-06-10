import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/app.css'
import Navbar from '../components/Navbar'

export default function OverviewPage() {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    useEffect(() => {
        document.title = 'Overview'
    }, [])

    const [deliveries, setDeliveries] = useState([])
    const [patients, setPatients] = useState([])
    const [riders, setRiders] = useState([])
    const [packages, setPackages] = useState([])

    useEffect(() => {
        fetch('http://localhost:4000/api/deliveries').then(r => r.json()).then(setDeliveries).catch(() => {})
        fetch('http://localhost:4000/api/patient').then(r => r.json()).then(setPatients).catch(() => {})
        fetch('http://localhost:4000/api/riders').then(r => r.json()).then(setRiders).catch(() => {})
        fetch('http://localhost:4000/api/packages').then(r => r.json()).then(setPackages).catch(() => {})
    }, [])

    const stats = [
        { label: 'Total Patients',        value: patients.length,                                          color: '#2563eb' },
        { label: 'Dispatched',            value: deliveries.filter(d => d.status === 'dispatched').length, color: '#f59e0b' },
        { label: 'Successful Deliveries', value: deliveries.filter(d => d.status === 'successful').length, color: '#16a34a' },
        { label: 'Failed Deliveries',     value: deliveries.filter(d => d.status === 'failed').length,     color: '#ef4444' },
        { label: 'Total Riders',          value: riders.length,                                            color: '#7c3aed' },
        { label: 'Packages Available',    value: packages.filter(p => !p.scanned).length,                 color: '#0891b2' },
    ]

    const recent = deliveries.slice(0, 8)

    const statusColor = { dispatched: 'pat-badge-blue', successful: 'pat-badge-green', failed: 'pat-badge-red' }

    return (
        <div className="vp-page">

            <Navbar active="Overview" />

            <div className="pat-content">

                <div className="pat-page-header">
                    <h1 className="pat-title">Overview</h1>
                </div>

                {/* Stat cards */}
                <div className="ov-cards">
                    {stats.map(s => (
                        <div key={s.label} className="ov-card">
                            <span className="ov-card-label">{s.label}</span>
                            <span className="ov-card-value" style={{ color: s.color }}>{s.value}</span>
                        </div>
                    ))}
                </div>

                {/* Recent deliveries */}
                <div className="pat-card" style={{ marginTop: 24 }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Recent Deliveries</h2>
                    </div>
                    <div className="vp-table-wrap">
                        <table className="del-table">
                            <thead>
                                <tr>
                                    <th>Package Code</th>
                                    <th>Patient</th>
                                    <th>Phone</th>
                                    <th>Location</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.length === 0 && (
                                    <tr><td colSpan={7} className="del-empty">No deliveries yet.</td></tr>
                                )}
                                {recent.map(d => (
                                    <tr key={d.id}>
                                        <td>{d.package_code || '—'}</td>
                                        <td>{d.patient_name || '—'}</td>
                                        <td>{d.phone_number || '—'}</td>
                                        <td>{d.location || '—'}</td>
                                        <td>{d.date ? new Date(d.date).toLocaleDateString('en-GB') : '—'}</td>
                                        <td><span className={`pat-badge ${statusColor[d.status] ?? 'pat-badge-gray'}`}>{d.status}</span></td>
                                        <td>
                                            <button className="del-view-btn" onClick={() => navigate(`/deliveries/${d.id}`)}>View</button>
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
