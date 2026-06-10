import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import '../styles/app.css'
import Navbar from '../components/Navbar'

export default function ViewDeliveryPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    useEffect(() => {
        document.title = 'View Delivery'
    }, [])

    const [delivery, setDelivery] = useState(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    async function updateStatus(status) {
        setUpdating(true)
        try {
            const res = await fetch(`http://localhost:4000/api/deliveries/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            })
            if (!res.ok) throw new Error()
            setDelivery(d => ({ ...d, status }))
        } catch {
            console.error('Failed to update status')
        } finally {
            setUpdating(false)
        }
    }

    useEffect(() => {
        fetch(`http://localhost:4000/api/deliveries/${id}`)
            .then(res => { if (!res.ok) throw new Error(); return res.json() })
            .then(data => setDelivery(data))
            .catch(err => console.error('Failed to load delivery:', err))
            .finally(() => setLoading(false))
    }, [id])

    const statusColor = {
        dispatched: 'pat-badge-blue',
        successful: 'pat-badge-green',
        failed:     'pat-badge-red',
    }

    if (loading) return <div className="vp-page" style={{ padding: 40 }}>Loading...</div>
    if (!delivery) return <div className="vp-page" style={{ padding: 40 }}>Delivery not found.</div>

    return (
        <div className="vp-page">

            <Navbar active="Deliveries" />

            {/* Subheader */}
            <div className="vp-subheader">
                <div className="vp-breadcrumb">
                    <span className="vp-breadcrumb-link" onClick={() => navigate('/deliveries')}>Deliveries</span>
                    <span className="vp-breadcrumb-sep"> / </span>
                    <span>{delivery.package_code || 'View Delivery'}</span>
                </div>
                <div className="vp-subheader-right">
                    <span className={`pat-badge ${statusColor[delivery.status] ?? 'pat-badge-gray'}`}>
                        {delivery.status}
                    </span>
                    {delivery.status === 'dispatched' && (
                        <>
                            <button
                                className="vp-save-btn"
                                disabled={updating}
                                onClick={() => updateStatus('successful')}
                            >
                                {updating ? 'Updating...' : 'Confirm Delivery'}
                            </button>
                            <button
                                className="vp-back-btn"
                                disabled={updating}
                                onClick={() => updateStatus('failed')}
                            >
                                Report Failed
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="vp-body">

                {/* Sidebar */}
                <div className="vp-sidebar">
                    <p className="vp-sidebar-label">Patient</p>
                    <div className="vp-sidebar-item"><strong>Name:</strong> {delivery.patient_name || '—'}</div>
                    <div className="vp-sidebar-item"><strong>Hospital ID:</strong> {delivery.patient_hospital_id || '—'}</div>
                    <div className="vp-sidebar-item"><strong>Phone:</strong> {delivery.patient_phone || '—'}</div>
                    <div className="vp-sidebar-item"><strong>Location:</strong> {delivery.patient_location || '—'}</div>

                    <p className="vp-sidebar-label" style={{ marginTop: 16 }}>Rider</p>
                    <div className="vp-sidebar-item"><strong>Name:</strong> {delivery.rider_name || 'Unassigned'}</div>
                    <div className="vp-sidebar-item"><strong>Area:</strong> {delivery.rider_area || '—'}</div>
                    <div className="vp-sidebar-item"><strong>Phone:</strong> {delivery.rider_phone || '—'}</div>
                </div>

                {/* Main */}
                <div className="vp-main">

                    <div className="vp-payment-row">
                        <span className="vp-payment-label">Payment Status</span>
                        <span className={`vp-badge ${delivery.payment_status ? 'paid' : 'unpaid'}`}>
                            {delivery.payment_status ? 'Paid' : 'Unpaid'}
                        </span>
                    </div>

                    <div className="vp-form" style={{ marginTop: 8 }}>

                        <div className="vp-field half">
                            <label>Package Code</label>
                            <input readOnly value={delivery.package_code || '—'} />
                        </div>

                        <div className="vp-field half">
                            <label>Drug Name</label>
                            <input readOnly value={delivery.drug_name || '—'} />
                        </div>

                        <div className="vp-field half">
                            <label>Drug Period (days)</label>
                            <input readOnly value={delivery.drug_period || '—'} />
                        </div>

                        <div className="vp-field half">
                            <label>Delivery Date</label>
                            <input readOnly value={delivery.date
                                ? new Date(delivery.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                                : '—'} />
                        </div>

                        <div className="vp-field half">
                            <label>Next Delivery Date</label>
                            <input readOnly value={delivery.next_date
                                ? new Date(delivery.next_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                                : '—'} />
                        </div>

                        <div className="vp-field half">
                            <label>Area</label>
                            <input readOnly value={delivery.area || '—'} />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
