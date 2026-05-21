import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import QrCode from '../components/icons/qrcode.png'
import '../styles/app.css'

export default function AssignPackage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const [activeTab, setActiveTab] = useState('drug-cycle')
    const [form, setForm] = useState({
        hospital_id: '',
        first_name: '',
        phone: '',
        days_supply: '',
        cycle_start: '',
        cycle_end: '',
        date: '',
        area: '',
        next_date: '',
        delivery_id: '',
    })
    const [loading, setLoading] = useState(true)

    const [riders, setRiders] = useState([])
    const [selectedRider, setSelectedRider] = useState(null)
    const [riderFilter, setRiderFilter] = useState('All')
    const [assigning, setAssigning] = useState(false)

    useEffect(() => {
        if (!id) return

        setLoading(true)
        fetch(`http://localhost:4000/api/patient/${id}`)
        .then(res => {
            if (!res.ok) throw new Error('Patient not found')
            return res.json()
        })
        .then(data => {
            setForm({
                hospital_id: data.hospital_id || '',
                first_name: data.name || '',
                phone: data.phone_number || '',
                days_supply: data.deliveries[0]?.days_supply || '',
                cycle_start: data.deliveries[0]?.cycle_start || '',
                cycle_end: data.deliveries[0]?.cycle_end || '',
                date: data.deliveries[0]?.date || '',
                area: data.deliveries[0]?.area || '',
                next_date: data.deliveries[0]?.next_date || '',
                delivery_id: data.deliveries[0]?.id || '',
            })
        })
        .catch(error => console.error('Failed to load patient:', error))
        .finally(() => setLoading(false))
    }, [id])

    useEffect(() => {
        fetch('http://localhost:4000/api/riders')
            .then(res => res.json())
            .then(setRiders)
            .catch(err => console.error('Failed to load riders:', err))
    }, [])

    const filteredRiders = riders.filter(r => {
        if (riderFilter === 'All') return true
        if (riderFilter === 'Unassigned') return r.number_of_deliveries === 0
        if (riderFilter === 'Assigned') return r.number_of_deliveries > 0
        return r.area?.toLowerCase() === riderFilter.toLowerCase()
    })

    // function handleAssignRider() {
    //     if (!selectedRider || !form.delivery_id) return
    //     setAssigning(true)
    //     fetch(`http://localhost:4000/api/deliveries/${form.delivery_id}/assign-rider`, {
    //         method: 'PATCH',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ riderId: selectedRider }),
    //     })
    //     .then(res => {
    //         if (!res.ok) throw new Error('Failed to assign rider')
    //         return res.json()
    //     })
    //     .then(() => setActiveTab('scan-package'))
    //     .catch(err => console.error(err))
    //     .finally(() => setAssigning(false))
    // }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    return (
        <div className="vp-page">

            {/* Navbar */}
            <nav className="vp-navbar">
                <div className="vp-logo">N</div>

                <div className="vp-nav-links">
                    <a className="vp-nav-link" onClick={() => navigate('/Overview')}>Overview</a>
                    <a className="vp-nav-link" onClick={() => navigate('/Deliveries')}>Deliveries</a>
                    <a className="vp-nav-link active">Patients</a>
                    <a className="vp-nav-link" onClick={() => navigate('/DispatchRiders')}>Dispatch Riders</a>
                    <a className="vp-nav-link" onClick={() => navigate('/Admin')}>Admin</a>
                </div>

                <div className="vp-user" onClick={() => { localStorage.removeItem('user'); navigate('/login') }}>
                    <div className="vp-avatar">{user.username?.[0]?.toUpperCase() || 'U'}</div>
                    <span>{user.username || 'User'}</span>
                    <span className="vp-chevron">▾</span>
                </div>
            </nav>

            {/* Sub header */}
            <div className="vp-subheader">
                <div className="vp-breadcrumb">
                    <span className="vp-breadcrumb-link" onClick={() => navigate('/patients')}>Patients</span>
                    <span className="vp-breadcrumb-link" onClick={() => navigate(`/patients/ViewPatient/${id}`)}> / View Patient</span>
                    <span className="vp-breadcrumb-sep"> / </span>
                    <span>Assign Package</span>
                </div>
            </div>

            {/* Body */}
            <div className="vp-body">

                {/* Sidebar */}
                <div className="vp-sidebar">
                    <p className="vp-sidebar-label">Patient's Information</p>
                    <div className="vp-sidebar-item">
                        <strong>Hospital ID:</strong> {form.hospital_id}
                    </div>
                    <div className="vp-sidebar-item">
                        <strong>First Name:</strong> {form.first_name}
                    </div>
                    <div className="vp-sidebar-item">
                        <strong>Phone:</strong> {form.phone}
                    </div>
                    <div className="vp-sidebar-item">
                        <strong>Area:</strong> {form.area}
                    </div>
                    <div className="vp-sidebar-item">
                        <strong>Next Delivery Date:</strong> {form.next_date}
                    </div>
                </div>

                {/* Main panel */}
                <div className="vp-main">

                    {/* Tabs */}
                    <div className="vp-tabs">
                        <button
                            className={`vp-tab ${activeTab === 'drug-cycle' ? 'active' : ''}`}
                            onClick={() => setActiveTab('drug-cycle')}
                        >
                            Set Drug Cycle/Length
                        </button>
                        <button
                            className={`vp-tab ${activeTab === 'assign-rider' ? 'active' : ''}`}
                            onClick={() => setActiveTab('assign-rider')}
                        >
                            Assign Dispatch Rider
                        </button>
                        <button
                            className={`vp-tab ${activeTab === 'scan-package' ? 'active' : ''}`}
                            onClick={() => setActiveTab('scan-package')}
                        >
                            Scan Package
                        </button>
                    </div>

                    {/* Tab content */}
                    {activeTab === 'drug-cycle' && (
                        <div className="vp-tab-content">
                            <div className="vp-form-header">
                                <div>
                                    <h1>{form.first_name} has a drug cycle of {form.days_supply} days.</h1>
                                </div>
                            </div>

                            <div className="vp-form">
                                <div className="vp-cycle-option">
                                    <label className="vp-cycle-label">
                                        <input type="radio" name="cycle" value="same" defaultChecked />
                                        Same as initial drug cycle
                                    </label>
                                </div>
                                <div className="vp-cycle-subtext">
                                    <p>Deliver drug on <strong>{form.date}</strong> &amp; set next delivery date to <strong>{form.next_date}</strong></p>
                                </div>

                                <div className="vp-cycle-option">
                                    <label className="vp-cycle-label">
                                        <input type="radio" name="cycle" value="new" />
                                        Set new drug cycle
                                    </label>
                                </div>

                                <div className="vp-form-footer">
                                    <button className="vp-save-btn">Next</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'assign-rider' && (
                        <div className="vp-tab-content">

                            {/* Filter pills */}
                            <div className="rider-filters">
                                {['All', 'Unassigned', 'Assigned'].map(f => (
                                    <button
                                        key={f}
                                        className={`rider-filter-btn ${riderFilter === f ? 'active' : ''}`}
                                        onClick={() => setRiderFilter(f)}
                                    >
                                        {f} ({
                                            f === 'All' ? riders.length :
                                            f === 'Unassigned' ? riders.filter(r => r.number_of_deliveries === 0).length :
                                            riders.filter(r => r.number_of_deliveries > 0).length
                                        })
                                    </button>
                                ))}
                            </div>

                            {/* Rider cards */}
                            <div className="rider-list">
                                {filteredRiders.length === 0 && (
                                    <p style={{ color: '#9ca3af', fontSize: 14 }}>No riders found.</p>
                                )}
                                {filteredRiders.map(rider => (
                                    <div
                                        key={rider.id}
                                        className={`rider-card ${selectedRider === rider.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedRider(rider.id)}
                                    >
                                        <input
                                            type="radio"
                                            name="rider"
                                            checked={selectedRider === rider.id}
                                            onChange={() => setSelectedRider(rider.id)}
                                        />
                                        <div className="rider-card-col">
                                            <span className="rider-card-label">Dispatch Rider's Name</span>
                                            <span className="rider-card-value">{rider.name}</span>
                                        </div>
                                        <div className="rider-card-col">
                                            <span className="rider-card-label">Delivery Area</span>
                                            <span className="rider-card-value">{rider.area}</span>
                                        </div>
                                        <div className="rider-card-col">
                                            <span className="rider-card-label">Number of Deliveries</span>
                                            <span className="rider-card-value">{rider.number_of_deliveries} Deliveries</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="vp-form-footer">
                                <button
                                    className="vp-save-btn"
                                    disabled={!selectedRider || assigning}
                                    // onClick={handleAssignRider}
                                >
                                    {assigning ? 'Assigning...' : 'Next'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'scan-package' && (
                        <div className="vp-tab-content">
                            <div className="vp-form-header">
                                <h1><p>Scan the package to assign to <strong>{form.first_name}</strong></p> </h1>
                            </div>
                            <div className="as-field">
                                <div className="as-field-qr">
                                    <img src={QrCode} alt="QR Code" className="qr-code"/>
                                    
                                <button className="vp-save-btn">
                                    Scan Package
                                </button>
                                </div>

                                <div className="as-field-code">

                                    <h2>Trouble scanning QR code?</h2>
                                    <h2>Enter manually</h2>

                                    <input 
                                    type="text"
                                    placeholder="Enter Code"
                                    />

                                    <button className="vp-save-btn">
                                        Submit Code
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                    )}

                </div>
            </div>
        </div>
    )
}