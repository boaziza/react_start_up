import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const links = [
    { label: 'Overview',        path: '/overview' },
    { label: 'Deliveries',      path: '/deliveries' },
    { label: 'Patients',        path: '/patients' },
    { label: 'Dispatch Riders', path: '/dispatchRiders' },
    { label: 'Admin',           path: '/admin' },
]

export default function Navbar({ active }) {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const [menuOpen, setMenuOpen] = useState(false)

    function logout() {
        localStorage.removeItem('user')
        navigate('/login')
    }

    return (
        <>
            <nav className="vp-navbar">
                <div className="vp-logo">N</div>

                {/* Desktop links */}
                <div className="vp-nav-links">
                    {links.map(link => (
                        <a
                            key={link.path}
                            className={`vp-nav-link ${active === link.label ? 'active' : ''}`}
                            onClick={() => navigate(link.path)}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                <div className="vp-navbar-right">
                    {/* User */}
                    <div className="vp-user" onClick={logout}>
                        <div className="vp-avatar">{user.username?.[0]?.toUpperCase() || 'U'}</div>
                        <span className="vp-username">{user.username || 'User'}</span>
                        <span className="vp-chevron">&#9662;</span>
                    </div>

                    {/* Hamburger — mobile only */}
                    <button
                        className="vp-hamburger"
                        onClick={() => setMenuOpen(o => !o)}
                        aria-label="Menu"
                    >
                        {menuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </nav>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div className="vp-mobile-menu">
                    {links.map(link => (
                        <a
                            key={link.path}
                            className={`vp-mobile-link ${active === link.label ? 'active' : ''}`}
                            onClick={() => { navigate(link.path); setMenuOpen(false) }}
                        >
                            {link.label}
                        </a>
                    ))}
                    <div className="vp-mobile-divider" />
                    <a className="vp-mobile-link logout" onClick={logout}>Log Out</a>
                </div>
            )}
        </>
    )
}
