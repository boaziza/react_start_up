import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import '../styles/app.css'
import Navbar from '../components/Navbar'

export default function ViewPatient() {
    const navigate = useNavigate()
    const { id } = useParams()
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const [activeTab, setActiveTab] = useState('patient')
    const [activeMenu, setActiveMenu] = useState('patient-profile')
    useEffect(() => {
        document.title = 'View Patient'
    }, [])

    const [editingPatient, setEditingPatient] = useState(false)
    const [editingDelivery, setEditingDelivery] = useState(false)

    const [form, setForm] = useState({
        hospital_id: '',
        first_name: '',
        gender: '',
        phone: '',
        email: '',
        location: '',
        address: '',
        next_delivery_date: '',
        default_drug_period: '',
        deliveries: [],
    })
    const [loading, setLoading] = useState(true)
    const [savingPatient, setSavingPatient] = useState(false)
    const [savingDelivery, setSavingDelivery] = useState(false)

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
            hospital_id:         data.hospital_id || '',
            first_name:          data.name || '',
            gender:              data.gender || '',
            phone:               data.phone_number || '',
            email:               data.email || '',
            location:            data.location || '',
            address:             data.address || '',
            next_delivery_date:  data.next_delivery_date || '',
            default_drug_period: data.default_drug_period || '',
            deliveries:          data.deliveries || [],
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

    async function handleSavePatient() {
        setSavingPatient(true)
        try {
            await fetch(`http://localhost:4000/api/patient/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hospital_id:  form.hospital_id,
                    name:         form.first_name,
                    gender:       form.gender,
                    phone_number: form.phone,
                    email:        form.email,
                }),
            })
            setEditingPatient(false)
        } catch (err) {
            console.error('Failed to save patient:', err)
        } finally {
            setSavingPatient(false)
        }
    }

    async function handleSaveDelivery() {
        setSavingDelivery(true)
        try {
            await fetch(`http://localhost:4000/api/patient/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    next_delivery_date:  form.next_delivery_date || null,
                    default_drug_period: form.default_drug_period ? Number(form.default_drug_period) : null,
                    location:            form.location || null,
                    address:             form.address || null,
                }),
            })
            setEditingDelivery(false)
        } catch (err) {
            console.error('Failed to save delivery info:', err)
        } finally {
            setSavingDelivery(false)
        }
    }

    return (
        <div className="vp-page">

            <Navbar active="Patients" />

            {/* Sub header */}
            <div className="vp-subheader">
                <div className="vp-breadcrumb">
                    <span className="vp-breadcrumb-link" onClick={() => navigate('/patients')}>Patients</span>
                    <span className="vp-breadcrumb-sep"> / </span>
                    <span>View Patient</span>
                </div>
                <div className="vp-subheader-right">
                    {form.next_delivery_date ? (
                        <p className="vp-delivery-note">
                            Patient's next delivery date is<br />
                            <strong>{new Date(form.next_delivery_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                        </p>
                    ) : (
                        <p className="vp-delivery-note" style={{ color: '#ef4444' }}>
                            Next delivery date not set.<br />
                            <strong>Set it in Delivery Information before assigning.</strong>
                        </p>
                    )}
                    <button
                        className="vp-assign-btn"
                        disabled={!form.next_delivery_date}
                        onClick={() => navigate(`/patients/ViewPatient/${id}/AssignPackage`)}
                        style={!form.next_delivery_date ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                    >
                        Assign Package to Patient
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="vp-body">

                {/* Sidebar */}
                <div className="vp-sidebar">
                    <p className="vp-sidebar-label">Patient's Information</p>
                    <div
                        className={`vp-sidebar-item ${activeMenu === 'patient-profile' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('patient-profile')}
                    >
                        Patient's Profile
                    </div>
                    <div
                        className={`vp-sidebar-item ${activeMenu === 'delivery-history' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('delivery-history')}
                    >
                        Delivery History
                    </div>
                </div>

                {/* Main panel */}
                {activeMenu === 'patient-profile' && (
                    <div className="vp-main">

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
                                    <button className="vp-edit-btn" onClick={() => setEditingPatient(e => !e)}>
                                        {editingPatient ? '✕ Cancel' : '✎ Edit Patient\'s Information'}
                                    </button>
                                </div>

                                <div className="vp-form">
                                    <div className="vp-field full">
                                        <label>Hospital ID</label>
                                        <input readOnly={!editingPatient} name="hospital_id" value={form.hospital_id} onChange={handleChange} />
                                    </div>

                                    <div className="vp-field full">
                                        <label>Full Name</label>
                                        <input readOnly={!editingPatient} name="first_name" value={form.first_name} onChange={handleChange} />
                                    </div>

                                    <div className="vp-field half">
                                        <label>Gender</label>
                                        <select disabled={!editingPatient} name="gender" value={form.gender} onChange={handleChange}>
                                            <option>Male</option>
                                            <option>Female</option>
                                        </select>
                                    </div>

                                    <div className="vp-field half">
                                        <label>Phone Number</label>
                                        <input readOnly={!editingPatient} name="phone" value={form.phone} onChange={handleChange} />
                                    </div>

                                    <div className="vp-field full">
                                        <label>Email Address</label>
                                        <input readOnly={!editingPatient} name="email" value={form.email} onChange={handleChange} />
                                    </div>
                                    <button className="vp-save-btn" disabled={!editingPatient || savingPatient} onClick={handleSavePatient}>
                                        <span>{savingPatient ? 'Saving...' : 'Save'}</span>
                                    </button>
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
                                    <button className="vp-edit-btn" onClick={() => setEditingDelivery(e => !e)}>
                                        {editingDelivery ? '✕ Cancel' : '✎ Edit Delivery Information'}
                                    </button>
                                </div>

                                <div className="vp-form">
                                    <div className="vp-field full">
                                        <label>Next Delivery Date</label>
                                        <input type="date" readOnly={!editingDelivery} name="next_delivery_date" value={form.next_delivery_date} onChange={handleChange} />
                                    </div>

                                    <div className="vp-field half">
                                        <label>Delivery Area</label>
                                        <input readOnly={!editingDelivery} name="location" value={form.location} onChange={handleChange} />
                                    </div>

                                    <div className="vp-field half">
                                        <label>Delivery Address</label>
                                        <input readOnly={!editingDelivery} name="address" value={form.address} onChange={handleChange} />
                                    </div>
                                </div>
                                <button className="vp-save-btn" disabled={!editingDelivery || savingDelivery} onClick={handleSaveDelivery}>
                                    <span>{savingDelivery ? 'Saving...' : 'Save'}</span>
                                </button>
                            </div>
                            
                        )}

                    </div>
                )}

            {activeMenu === 'delivery-history' &&(
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
                            {form.deliveries.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="del-empty">
                                        No deliveries found.
                                    </td>
                                </tr>
                            )}
                            {form.deliveries.map(d => (
                                <tr key={d.id}>
                                    <td>{d.package_code}</td>
                                    <td>{d.date}</td>
                                    <td>{form.first_name}</td>
                                    <td>{form.phone}</td>
                                    <td>{d.area}</td>
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
            )}
            </div>
        </div>
    )
}