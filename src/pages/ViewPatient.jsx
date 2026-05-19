import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ViewPatient() {
    const navigate = useNavigate()

    return (
        <div className="page">

            <nav className="navbar">

                {/* Logo */}
                <div className="logo">
                    N
                </div>

                {/* Links */}
                <div className="nav-links">
                    <a href="#" className="nav-link">
                        Overview
                    </a>
                    <a href="#" className="nav-link">
                        Deliveries
                    </a>
                    <a href="#" className="nav-link">
                        Patients
                    </a>
                    <a href="#" className="nav-link">
                        Dispatch Riders
                    </a>
                    <a href="#" className="nav-link">
                        Admin
                    </a>
                </div>

                {/* User */}
                <div  onClick={() => navigate('/login')}>
                    <div className="user-avatar">
                        E
                    </div>
                </div>
            </nav>

            <div className="page-content">

                {/* Page heading */}
                <div className="page-header">
                    <h1 className="page-title" onClick={() => navigate('/patients')}>Patient<span className="page-subtitle">/ViewPatient</span></h1>
                    <div className="page-header-actions">
                        <h1>Patient's next delivery is <span className="next-delivery-date"></span></h1>
                        <button className="assign-package-btn">
                            Assign Package to Patient
                        </button>
                    </div>
                </div>
            </div>

            <div className="patient-details">
                <div className="sidebar-menu">

                </div>
                <div className="tabs-container">
                    <div className="tab-item active">
                         <h1>Patient's Information</h1>
                         <p>Personal information about the Patient</p>
                        <button>
                            Edit Patient Information
                        </button>
                    </div>
                    <div className="tab-item">
                        <h1>Delivery Information</h1>
                        <p>Information about delivery status</p>
                        <button>
                            Edit Delivery Information
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}