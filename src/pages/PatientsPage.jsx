import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/app.css'

export default function PatientsPage() {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('hospital_id')
    const [page, setPage] = useState(1)
    const perPage = 10

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

                {/* Page heading */}
                <div className="pat-page-header">
                    <h1 className="pat-title">Patients</h1>
                    <button className="pat-add-btn">+ Add Patient</button>
                </div>

                {/* Card */}
                <div className="pat-card">

                    {/* Toolbar */}
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

                    {/* Table */}
                    <PatientTable
                        search={search}
                        sortBy={sortBy}
                        page={page}
                        setPage={setPage}
                        perPage={perPage}
                    />

                </div>
            </div>
        </div>
    )
}


function PatientTable({ search, sortBy, page, setPage, perPage }) {
    const navigate = useNavigate()
    const [patients, setPatients] = useState([])

    useEffect(() => {
        fetch('http://localhost:4000/api/patient')
            .then(res => res.json())
            .then(data => setPatients(data))
            .catch(err => console.error('Failed to fetch patients:', err))
    }, [])

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
                            <td colSpan={7} className="del-empty">No patients found.</td>
                        </tr>
                    ) : (
                        paginated.map(patient => (
                            <tr key={patient.id}>
                                <td>{patient.hospital_id}</td>
                                <td>{patient.name}</td>
                                <td>{patient.phone_number}</td>
                                <td>{new Date(patient.next_delivery_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                <td>{patient.location}</td>
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

            {/* Pagination */}
            <div className="pat-pagination">
                <span className="pat-pagination-info">
                    Showing {paginated.length} of {filtered.length} patients
                </span>
                <div className="pat-pagination-controls">
                    <button
                        className="pat-page-btn"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                        <button
                            key={n}
                            className={`pat-page-btn ${page === n ? 'active' : ''}`}
                            onClick={() => setPage(n)}
                        >
                            {n}
                        </button>
                    ))}
                    <button
                        className="pat-page-btn"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
        </>
    )
}
