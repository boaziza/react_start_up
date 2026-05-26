import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import '../styles/app.css'

export default function ViewPatient() {
    const navigate = useNavigate()
    const { id } = useParams()
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const [activeTab, setActiveTab] = useState('patient')
    const [activeMenu, setActiveMenu] = useState('rider')

    const [form, setForm] = useState({
        hospital_id: '',
        first_name: '',
        last_name: '',
        gender: '',
        phone: '',
        email: '',
        drug_name: '',
        days_supply: '',
        cycle_start: '',
        cycle_end: '',
        payment_status: '',
        package_code: '',
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
            last_name: data.last_name || '',
            gender: data.gender || '',
            phone: data.phone_number || '',
            email: data.email || '',
            drug_name: data.deliveries[0]?.drug_name || '',
            days_supply: data.deliveries[0]?.days_supply || '',
            cycle_start: data.deliveries[0]?.cycle_start || '',
            cycle_end: data.deliveries[0]?.cycle_end || '',
            payment_status: data.deliveries[0]?.payment_status ?? false,
            package_code: data.deliveries[0]?.package_code || '',
            date: data.deliveries[0]?.date || '',
            area: data.deliveries[0]?.area || '',
            address: data.deliveries[0]?.address || '',
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
                    <span className="vp-breadcrumb-sep"> / </span>
                    <span>View Patient</span>
                </div>
                <div className="vp-subheader-right">
                    <p className="vp-delivery-note">
                        Patient's next delivery date is<br />
                        <strong>{new Date(form.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}, in {form.days_supply} day(s)</strong>
                    </p>
                    <button className="vp-assign-btn" onClick={() => navigate(`/patients/ViewPatient/${id}/AssignPackage`)}>Assign Package to Patient</button>
                </div>
            </div>

            {/* Body */}
            <div className="vp-body">

                {/* Sidebar */}
                <div className="vp-sidebar">
                    <p className="vp-sidebar-label">Patient</p>
                    <div
                        className={`vp-sidebar-item ${activeMenu === 'rider' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('rider')}
                    >
                        Patient's Profile
                    </div>
                    <div
                        className={`vp-sidebar-item ${activeMenu === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('history')}
                    >
                        Delivery History
                    </div>
                </div>

                {/* Main panel */}
                <div className="vp-main">

                    {/* Payment status */}
                    <div className="vp-payment-row">
                        <span className="vp-payment-label">Payment Status</span>
                        <span className="vp-badge paid">Paid</span>
                    </div>

                    {/* Tabs */}
                    <div className="vp-tabs">
                        <button
                            className={`vp-tab ${activeTab === 'patient' ? 'active' : ''}`}
                            onClick={() => setActiveTab('patient')}
                        >
                            Patient Information
                        </button>
                        <button
                            className={`vp-tab ${activeTab === 'delivery' ? 'active' : ''}`}
                            onClick={() => setActiveTab('delivery')}
                        >
                            Delivery Information
                        </button>
                    </div>

                    {/* Tab content */}
                    {activeTab === 'patient' && (
                        <div className="vp-tab-content">
                            <div className="vp-form-header">
                                <div>
                                    <h2>Patient's Information</h2>
                                    <p>Personal information about Patient.</p>
                                </div>
                                <button className="vp-edit-btn">✎ Edit Patient's Information</button>
                            </div>

                            <div className="vp-form">
                                <div className="vp-field full">
                                    <label>Hospital ID</label>
                                    <input
                                        name="hospital_id"
                                        value={form.hospital_id}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="vp-field half">
                                    <label>First Name</label>
                                    <input
                                        name="first_name"
                                        value={form.first_name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="vp-field half">
                                    <label>Last Name</label>
                                    <input
                                        name="last_name"
                                        value={form.last_name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="vp-field half">
                                    <label>Gender</label>
                                    <select name="gender" value={form.gender} onChange={handleChange}>
                                        <option>Male</option>
                                        <option>Female</option>
                                    </select>
                                </div>

                                <div className="vp-field half">
                                    <label>Phone Number</label>
                                    <input
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="vp-field full">
                                    <label>Email Address</label>
                                    <input
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="vp-form-footer">
                                    <button className="vp-save-btn">Save Changes</button>
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