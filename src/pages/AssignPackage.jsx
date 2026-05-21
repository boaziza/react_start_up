import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import '../styles/viewPatient.css'

export default function AssignPackage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const [activeTab, setActiveTab] = useState('patient')
    const [activeMenu, setActiveMenu] = useState('rider')

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
    })
    const [loading, setLoading] = useState(true)

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
            })
        })
        .catch(error => {
            console.error('Failed to load patient:', error)
        })
        .finally(() => {
            setLoading(false)
        })
    }, [id])

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
                    <a className="vp-nav-link active" onClick={() => navigate('/Patients')}>Patients</a>
                    <a className="vp-nav-link" onClick={() => navigate('/DispatchRiders')}>Dispatch Riders</a>
                    <a className="vp-nav-link" onClick={() => navigate('/Admin')}>Admin</a>
                </div>

                <div className="vp-user" onClick={() => navigate('/login')}>
                    <div className="vp-avatar">E</div>
                    <span>Emmanuel Adigwe</span>
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
                            className={`vp-tab ${activeTab === 'scan-page' ? 'active' : ''}`}
                            onClick={() => setActiveTab('scan-page')}
                        >
                            Scan Page
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

                    {activeTab === 'delivery' && (
                        <div className="vp-tab-content">
                            <div className="vp-form-header">
                                <div>
                                    <h2>Delivery Information</h2>
                                    <p>Information about delivery status.</p>
                                </div>
                                <button className="vp-edit-btn">✎ Edit Delivery Information</button>
                            </div>

                            <div className="vp-form">
                                <div className="vp-field full">
                                    <label>Next Delivery Date</label>
                                    <input
                                        name="next_delivery_date"
                                        value={form.date}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="vp-field half">
                                    <label>Delivery Area</label>
                                    <input
                                        name="delivery_area"
                                        value={form.area}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="vp-field half">
                                    <label>Delivery Address</label>
                                    <input
                                        name="delivery_address"
                                        value={form.address}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="vp-field half">
                                    <label>Payment Status</label>
                                    <input
                                        name="payment_status"
                                        value={form.payment_status ? 'Paid' : 'Unpaid'}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="vp-form-footer">
                                    <button className="vp-save-btn">Save Changes</button>
                                </div>
                            </div>
                        </div>
                        
                    )}

                </div>
            </div>
        </div>
    )
}