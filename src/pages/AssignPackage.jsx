import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BrowserQRCodeReader } from '@zxing/browser'
import QrCode from '../components/icons/qrcode.png'
import '../styles/app.css'

export default function AssignPackage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    const [activeTab, setActiveTab] = useState('drug-cycle')
    const [cycleChoice, setCycleChoice] = useState('same')

    const [form, setForm] = useState({
        hospital_id: '',
        first_name: '',
        phone: '',
        days_supply: '',
        date: '',
        area: '',
        next_date: '',
        delivery_id: '',
        package_code: '',
    })
    const [loading, setLoading] = useState(true)

    // rider states
    const [riders, setRiders] = useState([])
    const [selectedRider, setSelectedRider] = useState(null)
    const [riderFilter, setRiderFilter] = useState('All')
    const [assigning, setAssigning] = useState(false)

    // scan states
    const [manualCode, setManualCode] = useState('')
    const [scanError, setScanError] = useState('')
    const [scanSuccess, setScanSuccess] = useState(false)
    const [confirming, setConfirming] = useState(false)
    const [scanning, setScanning] = useState(false)
    const videoRef = useRef(null)
    const codeReaderRef = useRef(null)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        fetch(`http://localhost:4000/api/patient/${id}`)
            .then(res => { if (!res.ok) throw new Error(); return res.json() })
            .then(data => setForm({
                hospital_id:  data.hospital_id || '',
                first_name:   data.name || '',
                phone:        data.phone_number || '',
                days_supply:  data.deliveries[0]?.days_supply || '',
                date:         data.deliveries[0]?.date || '',
                area:         data.deliveries[0]?.area || '',
                next_date:    data.deliveries[0]?.next_date || '',
                delivery_id:  data.deliveries[0]?.id || '',
                package_code: data.deliveries[0]?.package_code || '',
            }))
            .catch(err => console.error('Failed to load patient:', err))
            .finally(() => setLoading(false))
    }, [id])

    useEffect(() => {
        fetch('http://localhost:4000/api/riders')
            .then(res => res.json())
            .then(setRiders)
            .catch(err => console.error('Failed to load riders:', err))
    }, [])

    // stop camera when leaving scan tab
    useEffect(() => {
        if (activeTab !== 'scan-package') stopScanner()
    }, [activeTab])

    const filteredRiders = riders.filter(r => {
        if (riderFilter === 'All')        return true
        if (riderFilter === 'Unassigned') return r.delivery_count === 0
        if (riderFilter === 'Assigned')   return r.delivery_count > 0
        return true
    })

    function handleAssignRider() {
        if (!selectedRider || !form.delivery_id) return
        setAssigning(true)
        fetch(`http://localhost:4000/api/deliveries/${form.delivery_id}/assign-rider`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ riderId: selectedRider }),
        })
            .then(res => { if (!res.ok) throw new Error('Failed to assign rider'); return res.json() })
            .then(() => setActiveTab('scan-package'))
            .catch(err => console.error(err))
            .finally(() => setAssigning(false))
    }

    function validateCode(code) {
        if (!form.package_code) { setScanError('No package code on file for this delivery'); return }
        if (code.trim() === form.package_code.trim()) {
            setScanError('')
            setScanSuccess(true)
        } else {
            setScanError(`Code "${code}" does not match package code`)
        }
    }

    async function startScanner() {
        setScanError('')
        setScanning(true)
        codeReaderRef.current = new BrowserQRCodeReader()
        try {
            await codeReaderRef.current.decodeFromVideoDevice(
                undefined,
                videoRef.current,
                (result, err) => {
                    if (result) {
                        stopScanner()
                        validateCode(result.getText())
                    }
                }
            )
        } catch (e) {
            setScanError('Camera not available. Use manual entry.')
            setScanning(false)
        }
    }

    function stopScanner() {
        if (codeReaderRef.current) {
            BrowserQRCodeReader.releaseAllStreams()
            codeReaderRef.current = null
        }
        setScanning(false)
    }

    function handleConfirm() {
        if (!form.delivery_id) return
        setConfirming(true)
        fetch(`http://localhost:4000/api/deliveries/${form.delivery_id}/confirm`, {
            method: 'PATCH',
        })
            .then(res => { if (!res.ok) throw new Error(); return res.json() })
            .then(() => navigate('/deliveries'))
            .catch(() => setScanError('Failed to confirm. Try again.'))
            .finally(() => setConfirming(false))
    }

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
                    <span className="vp-chevron">▾</span>
                </div>
            </nav>

            {/* Breadcrumb */}
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
                    <div className="vp-sidebar-item"><strong>Hospital ID:</strong> {form.hospital_id}</div>
                    <div className="vp-sidebar-item"><strong>Name:</strong> {form.first_name}</div>
                    <div className="vp-sidebar-item"><strong>Phone:</strong> {form.phone}</div>
                    <div className="vp-sidebar-item"><strong>Area:</strong> {form.area}</div>
                    <div className="vp-sidebar-item"><strong>Next Delivery:</strong> {form.next_date}</div>
                </div>

                {/* Main panel */}
                <div className="vp-main">

                    {/* Tabs */}
                    <div className="vp-tabs">
                        <button className={`vp-tab ${activeTab === 'drug-cycle' ? 'active' : ''}`} onClick={() => setActiveTab('drug-cycle')}>
                            Set Drug Cycle/Length
                        </button>
                        <button className={`vp-tab ${activeTab === 'assign-rider' ? 'active' : ''}`} onClick={() => setActiveTab('assign-rider')}>
                            Assign Dispatch Rider
                        </button>
                        <button className={`vp-tab ${activeTab === 'scan-package' ? 'active' : ''}`} onClick={() => setActiveTab('scan-package')}>
                            Scan Package
                        </button>
                    </div>

                    {/* ── Tab 1: Drug Cycle ── */}
                    {activeTab === 'drug-cycle' && (
                        <div className="vp-tab-content">
                            <div className="vp-form-header">
                                <h2>{form.first_name} has a drug cycle of <strong>{form.days_supply}</strong> days.</h2>
                            </div>

                            <div className="vp-form">
                                <div className="vp-cycle-option">
                                    <label className="vp-cycle-label">
                                        <input type="radio" name="cycle" value="same"
                                            checked={cycleChoice === 'same'}
                                            onChange={() => setCycleChoice('same')} />
                                        Same as initial drug cycle
                                    </label>
                                </div>

                                {cycleChoice === 'same' && (
                                    <div className="vp-cycle-subtext">
                                        <p>Deliver drug on <strong>{form.date}</strong> &amp; set next delivery date to <strong>{form.next_date}</strong></p>
                                    </div>
                                )}

                                <div className="vp-cycle-option">
                                    <label className="vp-cycle-label">
                                        <input type="radio" name="cycle" value="new"
                                            checked={cycleChoice === 'new'}
                                            onChange={() => setCycleChoice('new')} />
                                        Set new drug cycle
                                    </label>
                                </div>

                                {cycleChoice === 'new' && (
                                    <div className="vp-cycle-subtext">
                                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                            <div className="vp-field half">
                                                <label>New Delivery Date</label>
                                                <input type="date" name="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                                            </div>
                                            <div className="vp-field half">
                                                <label>Next Delivery Date</label>
                                                <input type="date" name="next_date" value={form.next_date} onChange={e => setForm({ ...form, next_date: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="vp-form-footer">
                                    <button className="vp-save-btn" onClick={() => setActiveTab('assign-rider')}>
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Tab 2: Assign Rider ── */}
                    {activeTab === 'assign-rider' && (
                        <div className="vp-tab-content">
                            <div className="rider-filters">
                                {['All', 'Unassigned', 'Assigned'].map(f => (
                                    <button key={f}
                                        className={`rider-filter-btn ${riderFilter === f ? 'active' : ''}`}
                                        onClick={() => setRiderFilter(f)}
                                    >
                                        {f} ({
                                            f === 'All'        ? riders.length :
                                            f === 'Unassigned' ? riders.filter(r => r.delivery_count === 0).length :
                                            riders.filter(r => r.delivery_count > 0).length
                                        })
                                    </button>
                                ))}
                            </div>

                            <div className="rider-list">
                                {filteredRiders.length === 0 && (
                                    <p style={{ color: '#9ca3af', fontSize: 14 }}>No riders found.</p>
                                )}
                                {filteredRiders.map(rider => (
                                    <div key={rider.id}
                                        className={`rider-card ${selectedRider === rider.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedRider(rider.id)}
                                    >
                                        <input type="radio" name="rider"
                                            checked={selectedRider === rider.id}
                                            onChange={() => setSelectedRider(rider.id)} />
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
                                            <span className="rider-card-value">{rider.delivery_count} Deliveries</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="vp-form-footer">
                                <button className="vp-save-btn"
                                    disabled={!selectedRider || assigning}
                                    onClick={handleAssignRider}
                                >
                                    {assigning ? 'Assigning...' : 'Next'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Tab 3: Scan Package ── */}
                    {activeTab === 'scan-package' && (
                        <div className="vp-tab-content">
                            <div className="vp-form-header">
                                <div>
                                    <h2>Scan package for <strong>{form.first_name}</strong></h2>
                                    <p>Package code: <strong>{form.package_code || 'N/A'}</strong></p>
                                </div>
                            </div>

                            <div className="as-field">

                                {/* Camera scanner */}
                                <div className="as-field-qr">
                                    <video ref={videoRef} style={{
                                        width: 220, height: 220,
                                        borderRadius: 8,
                                        border: '2px solid #e5e7eb',
                                        display: scanning ? 'block' : 'none',
                                        objectFit: 'cover'
                                    }} />
                                    {!scanning && (
                                        <img src={QrCode} alt="QR Code" className="qr-code" />
                                    )}
                                    <div style={{ marginTop: 12 }}>
                                        {!scanning ? (
                                            <button className="vp-save-btn" onClick={startScanner}>
                                                Start Camera
                                            </button>
                                        ) : (
                                            <button className="vp-save-btn" style={{ background: '#ef4444' }} onClick={stopScanner}>
                                                Stop Camera
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Manual entry */}
                                <div className="as-field-code">
                                    <h2>Trouble scanning?</h2>
                                    <h2>Enter code manually</h2>
                                    <input
                                        type="text"
                                        placeholder="Enter package code"
                                        value={manualCode}
                                        onChange={e => { setManualCode(e.target.value); setScanError(''); setScanSuccess(false) }}
                                    />
                                    <button className="vp-save-btn" onClick={() => validateCode(manualCode)}>
                                        Verify Code
                                    </button>

                                    {scanError && (
                                        <p style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}>{scanError}</p>
                                    )}

                                    {scanSuccess && (
                                        <div>
                                            <p style={{ color: '#16a34a', fontSize: 13, marginTop: 8, marginBottom: 12 }}>
                                                ✓ Code matched! Ready to confirm.
                                            </p>
                                            <button className="vp-save-btn" style={{ background: '#16a34a' }}
                                                disabled={confirming}
                                                onClick={handleConfirm}
                                            >
                                                {confirming ? 'Confirming...' : 'Confirm Package'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
