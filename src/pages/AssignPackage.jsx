import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BrowserQRCodeReader } from '@zxing/browser'
import { DecodeHintType } from '@zxing/library'
import Navbar from '../components/Navbar'
import QrCode from '../components/icons/qrcode.png'
import '../styles/app.css'

function QrScanner({ onScan, onError }) {
    const videoRef = useRef(null)

    useEffect(() => {
        const hints = new Map()
        hints.set(DecodeHintType.TRY_HARDER, true)
        const reader = new BrowserQRCodeReader(hints)
        let active = true

        reader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
            if (!active) return
            if (result) {
                active = false
                BrowserQRCodeReader.releaseAllStreams()
                onScan(result.getText())
            }
        }).catch(() => {
            if (active) onError()
        })

        return () => {
            active = false
            BrowserQRCodeReader.releaseAllStreams()
        }
    }, [])

    return (
        <div className="as-scan-state">
            <div className="as-scan-box">
                <video ref={videoRef} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                <div className="as-scan-line" />
            </div>
            <p className="as-scan-status">Scanning Package...</p>
        </div>
    )
}

export default function AssignPackage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    useEffect(() => {
        document.title = 'Assign Package'
    }, [])

    const [activeTab, setActiveTab] = useState('drug-cycle')
    const [cycleChoice, setCycleChoice] = useState('same')
    const [newDrugPeriod, setNewDrugPeriod] = useState('')
    const [savingCycle, setSavingCycle] = useState(false)

    const [confirmedPeriod, setConfirmedPeriod] = useState('')

    const [form, setForm] = useState({
        hospital_id: '',
        first_name: '',
        phone: '',
        area: '',
        address: '',
        next_delivery_date: '',
        default_drug_period: '',
    })
    const [loading, setLoading] = useState(true)

    function addDays(dateStr, days) {
        const d = new Date(dateStr)
        d.setDate(d.getDate() + Number(days))
        return d
    }

    const sameNextDate = form.next_delivery_date && form.default_drug_period
        ? addDays(form.next_delivery_date, form.default_drug_period)
            .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : ''

    const calculatedNextDate = form.next_delivery_date && newDrugPeriod
        ? addDays(form.next_delivery_date, newDrugPeriod)
            .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : ''

    const deliveryDateFormatted = form.next_delivery_date
        ? new Date(form.next_delivery_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : '—'

    // rider states
    const [riders, setRiders] = useState([])
    const [selectedRider, setSelectedRider] = useState(null)
    const [riderFilter, setRiderFilter] = useState('All')

    // scan states
    const [scanMode, setScanMode] = useState('idle') // idle | scanning | manual | verified
    const [manualCode, setManualCode] = useState('')
    const [scanError, setScanError] = useState('')
    const [validating, setValidating] = useState(false)
    const [verifiedCode, setVerifiedCode] = useState('')
    const [verifiedPackageId, setVerifiedPackageId] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [confirming, setConfirming] = useState(false)


    useEffect(() => {
        if (!id) return
        setLoading(true)
        fetch(`http://localhost:4000/api/patient/${id}`)
            .then(res => { if (!res.ok) throw new Error(); return res.json() })
            .then(data => setForm({
                hospital_id:         data.hospital_id || '',
                first_name:          data.name || '',
                phone:               data.phone_number || '',
                area:                data.location || '',
                address:             data.address || '',
                next_delivery_date:  data.next_delivery_date || '',
                default_drug_period: data.default_drug_period || '',
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

    // stop scanning when leaving scan tab
    useEffect(() => {
        if (activeTab !== 'scan-package') setScanMode('idle')
    }, [activeTab])

    async function handleDrugCycleNext() {
        const period = cycleChoice === 'same' ? form.default_drug_period : newDrugPeriod
        if (!form.next_delivery_date || !period) return
        setSavingCycle(true)

        const newNextDate = addDays(form.next_delivery_date, period).toISOString().split('T')[0]
        const patientUpdate = { next_delivery_date: newNextDate }
        if (cycleChoice === 'new') patientUpdate.default_drug_period = Number(newDrugPeriod)

        try {
            await fetch(`http://localhost:4000/api/patient/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patientUpdate),
            })
            setConfirmedPeriod(Number(period))
            setActiveTab('assign-rider')
        } catch (err) {
            console.error('Failed to save drug cycle:', err)
        } finally {
            setSavingCycle(false)
        }
    }

    const filteredRiders = riders.filter(r => {
        if (riderFilter === 'All')        return true
        if (riderFilter === 'Unassigned') return r.delivery_count === 0
        if (riderFilter === 'Assigned')   return r.delivery_count > 0
        return true
    })

    function handleAssignRider() {
        if (!selectedRider) return
        setActiveTab('scan-package')
    }

    async function validateQrCode(qrValue) {
        if (!qrValue) return
        setScanMode('idle')
        setValidating(true)
        setScanError('')
        try {
            const res = await fetch(`http://localhost:4000/api/packages/by-qr?qr_code=${encodeURIComponent(qrValue)}`)
            const data = await res.json()
            if (!res.ok) { setScanError(data.error || 'Invalid package'); return }
            setVerifiedCode(data.package_code)
            setVerifiedPackageId(data.id)
            setScanMode('verified')
        } catch {
            setScanError('Failed to validate package. Try again.')
        } finally {
            setValidating(false)
        }
    }

    async function validateManualCode(code) {
        if (!code.trim()) { setScanError('Please enter a code'); return }
        setValidating(true)
        setScanError('')
        try {
            const res = await fetch(`http://localhost:4000/api/packages/by-code?package_code=${encodeURIComponent(code.trim())}`)
            const data = await res.json()
            if (!res.ok) { setScanError(data.error || 'Invalid package'); return }
            setVerifiedCode(data.package_code)
            setVerifiedPackageId(data.id)
            setScanMode('verified')
        } catch {
            setScanError('Failed to validate package. Try again.')
        } finally {
            setValidating(false)
        }
    }

    function resetScan() {
        setVerifiedCode('')
        setVerifiedPackageId('')
        setManualCode('')
        setScanError('')
        setScanMode('idle')
    }

    async function handleConfirm() {
        if (!selectedRider || !verifiedPackageId) return
        setConfirming(true)
        setShowModal(false)
        try {
            const res = await fetch(`http://localhost:4000/api/deliveries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id:   id,
                    rider_id:     selectedRider,
                    package_code: verifiedCode,
                    date:         form.next_delivery_date,
                    drug_period:  confirmedPeriod,
                    area:         form.area,
                    address:      form.address,
                }),
            })
            if (!res.ok) throw new Error('Failed to create delivery')

            await fetch(`http://localhost:4000/api/packages/${verifiedPackageId}/scan`, {
                method: 'PATCH',
            }).then(r => { if (!r.ok) throw new Error('Failed to mark package scanned') })

            navigate('/deliveries')
        } catch (err) {
            setScanError(err.message || 'Failed to confirm. Try again.')
        } finally {
            setConfirming(false)
        }
    }

    return (
        <div className="vp-page">

            {/* Navbar */}
            <Navbar active="Patients" />

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
                    <div className="vp-sidebar-item"><strong>Next Delivery:</strong> {deliveryDateFormatted}</div>
                </div>

                {/* Main panel */}
                <div className="vp-main">

                    {/* Tabs */}
                    <div className="vp-tabs">
                        <span className={`vp-tab ${activeTab === 'drug-cycle' ? 'active' : ''}`}>
                            {(activeTab === 'assign-rider' || activeTab === 'scan-package') && <span className="vp-tab-check">✓</span>}
                            Set Drug Cycle/Length
                        </span>
                        <span className={`vp-tab ${activeTab === 'assign-rider' ? 'active' : ''}`}>
                            {activeTab === 'scan-package' && <span className="vp-tab-check">✓</span>}
                            Assign Dispatch Rider
                        </span>
                        <span className={`vp-tab ${activeTab === 'scan-package' ? 'active' : ''}`}>
                            Scan Package
                        </span>
                    </div>

                    {/* ── Tab 1: Drug Cycle ── */}
                    {activeTab === 'drug-cycle' && (
                        <div className="vp-tab-content">
                            <div className="vp-form-header">
                                <div>
                                    <h2>Set drug cycle for <strong>{form.first_name}</strong></h2>
                                    <p>Delivery date: <strong>{deliveryDateFormatted}</strong></p>
                                </div>
                            </div>

                            <div className="vp-form">
                                <div className="vp-cycle-option">
                                    <label className="vp-cycle-label">
                                        <input type="radio" name="cycle" value="same"
                                            checked={cycleChoice === 'same'}
                                            onChange={() => setCycleChoice('same')} />
                                        Same as initial drug cycle ({form.default_drug_period} days)
                                    </label>
                                </div>

                                {cycleChoice === 'same' && (
                                    <div className="vp-cycle-subtext">
                                        <p>Drug period: <strong>{form.default_drug_period} days</strong></p>
                                        <p style={{ marginTop: 6 }}>Next delivery date: <strong>{sameNextDate || '—'}</strong></p>
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
                                        <div className="vp-field half">
                                            <label>New Drug Period (days)</label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 30"
                                                value={newDrugPeriod}
                                                onChange={e => setNewDrugPeriod(e.target.value)}
                                            />
                                        </div>
                                        {calculatedNextDate && (
                                            <p style={{ marginTop: 12, fontSize: 14, color: '#374151' }}>
                                                Next delivery date: <strong>{calculatedNextDate}</strong>
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="vp-form-footer">
                                    <button
                                        className="vp-save-btn"
                                        disabled={savingCycle || (cycleChoice === 'new' && !newDrugPeriod)}
                                        onClick={handleDrugCycleNext}
                                    >
                                        {savingCycle ? 'Saving...' : 'Next'}
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
                                            <span className="rider-card-value">{rider.number_of_deliveries} Deliveries</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="vp-form-footer" style={{ justifyContent: 'space-between' }}>
                                <button className="vp-back-btn" onClick={() => setActiveTab('drug-cycle')}>Back</button>
                                <button className="vp-save-btn" disabled={!selectedRider} onClick={handleAssignRider}>Next</button>
                            </div>
                        </div>
                    )}

                    {/* ── Tab 3: Scan Package ── */}
                    {activeTab === 'scan-package' && (
                        <div className="vp-tab-content">
                            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 24 }}>
                                Scan a package to assign it to <strong>{form.first_name}</strong>
                            </h2>

                            {/* State: idle */}
                            {scanMode === 'idle' && (
                                <div className="as-qr-idle">
                                    <img src={QrCode} alt="QR" style={{ width: 120, height: 120, opacity: 0.2 }} />
                                    {scanError && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 12, textAlign: 'center' }}>{scanError}</p>}
                                </div>
                            )}

                            {/* State: scanning */}
                            {scanMode === 'scanning' && (
                                <QrScanner
                                    onScan={validateQrCode}
                                    onError={() => { setScanError('Camera not available. Use manual entry.'); setScanMode('idle') }}
                                />
                            )}

                            {/* State: manual entry */}
                            {scanMode === 'manual' && (
                                <div className="as-manual-state">
                                    <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
                                        Trouble scanning QR Code? Enter the package code manually.
                                    </p>
                                    <input
                                        className="as-manual-input"
                                        type="text"
                                        placeholder="Enter Package Code"
                                        value={manualCode}
                                        autoFocus
                                        onChange={e => { setManualCode(e.target.value); setScanError('') }}
                                        onKeyDown={e => e.key === 'Enter' && validateManualCode(manualCode)}
                                    />
                                    {scanError && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 6 }}>{scanError}</p>}
                                </div>
                            )}

                            {/* State: verified */}
                            {scanMode === 'verified' && (
                                <div className="as-code-confirmed">
                                    <p className="as-code-label">Package Code</p>
                                    <div className="as-code-box">{verifiedCode}</div>
                                    <button className="as-code-remove" onClick={resetScan}>✕ Remove</button>
                                </div>
                            )}

                            {/* Bottom buttons */}
                            <div className="as-scan-footer">
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {scanMode === 'idle' && (
                                        <>
                                            <button className="as-scan-btn" onClick={() => { setScanError(''); setScanMode('scanning') }}>
                                                Scan Package
                                            </button>
                                            <button className="as-submit-btn" onClick={() => { setScanError(''); setScanMode('manual') }}>
                                                Submit Code
                                            </button>
                                        </>
                                    )}
                                    {scanMode === 'scanning' && (
                                        <button className="as-submit-btn" onClick={() => setScanMode('idle')}>Cancel</button>
                                    )}
                                    {scanMode === 'manual' && (
                                        <>
                                            <button className="as-scan-btn" disabled={validating} onClick={() => validateManualCode(manualCode)}>
                                                {validating ? 'Checking...' : 'Submit Code'}
                                            </button>
                                            <button className="as-submit-btn" onClick={() => { setScanMode('idle'); setScanError('') }}>Cancel</button>
                                        </>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button className="vp-back-btn" onClick={() => { setScanMode('idle'); setActiveTab('assign-rider') }}>
                                        Back
                                    </button>
                                    <button className="vp-save-btn"
                                        disabled={scanMode !== 'verified' || confirming}
                                        onClick={() => setShowModal(true)}
                                    >
                                        {confirming ? 'Assigning...' : 'Assign Package'}
                                    </button>
                                </div>
                            </div>

                            {/* Confirmation modal */}
                            {showModal && (
                                <div className="as-modal-overlay">
                                    <div className="as-modal">
                                        <h3 className="as-modal-title">Assign Package {verifiedCode}</h3>
                                        <p className="as-modal-body">
                                            Are you sure you want to assign package <strong>{verifiedCode}</strong> to <strong>{form.first_name}</strong>?
                                        </p>
                                        <div className="as-modal-footer">
                                            <button className="as-submit-btn" onClick={() => setShowModal(false)}>
                                                No, Go Back
                                            </button>
                                            <button className="vp-save-btn" onClick={handleConfirm} disabled={confirming}>
                                                {confirming ? 'Assigning...' : 'Yes, Assign Package'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
