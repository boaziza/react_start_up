import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PatientsPage() {
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('hospital_id')
    const [page, setPage] = useState(1)
    const perPage = 10

    return (
        <div className="min-h-screen bg-gray-100">

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 px-6 py-0 flex items-center justify-between h-14">

                {/* Logo */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white font-bold text-sm flex-shrink-0">
                    N
                </div>

                {/* Links */}
                <div className="flex items-center h-full">
                    <a href="#" className="h-full flex items-center px-4 text-gray-400 text-sm border-b-2 border-transparent hover:text-gray-600">
                        Overview
                    </a>
                    <a href="#" className="h-full flex items-center px-4 text-gray-400 text-sm border-b-2 border-transparent hover:text-gray-600">
                        Deliveries
                    </a>
                    <a href="#" className="h-full flex items-center px-4 text-blue-600 text-sm font-semibold border-b-2 border-blue-600">
                        Patients
                    </a>
                    <a href="#" className="h-full flex items-center px-4 text-gray-400 text-sm border-b-2 border-transparent hover:text-gray-600">
                        Dispatch Riders
                    </a>
                    <a href="#" className="h-full flex items-center px-4 text-gray-400 text-sm border-b-2 border-transparent hover:text-gray-600">
                        Admin
                    </a>
                </div>

                {/* User */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/login')}>
                    <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white text-sm font-semibold">
                        E
                    </div>
                    <span className="text-sm text-gray-700">Emmanuel Adigun</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </nav>

            <div className="px-8 py-6">

                {/* Page heading */}
                <div className="flex items-center justify-between mb-5">
                    <h1 className="text-xl font-semibold text-gray-800">Patients</h1>
                    <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md">
                        + Add Patient
                    </button>
                </div>

                {/* White card */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">

                    {/* Sort + Search bar */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Sort by</span>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
                                    className="appearance-none border border-gray-300 rounded px-3 py-1.5 pr-7 text-sm text-gray-700 outline-none focus:border-blue-400 bg-white cursor-pointer"
                                >
                                    <option value="hospital_id">Hospital ID</option>
                                    <option value="name">Name</option>
                                </select>
                                <svg className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by patient name, id..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-56 outline-none focus:border-blue-400 text-gray-700 placeholder-gray-400"
                        />
                    </div>

                    {/* Table */}
                    <Tables search={search} sortBy={sortBy} page={page} setPage={setPage} perPage={perPage} />

                </div>
            </div>
        </div>
    )
}

function StatusBadge({ status }) {
    const map = {
        'Completed':    'bg-green-100 text-green-700',
        'Due & Paid':   'bg-orange-100 text-orange-500',
        'Due & Unpaid': 'bg-red-100 text-red-500',
        'Assigned':     'bg-blue-100 text-blue-600',
        'Paid':         'bg-green-100 text-green-700',
    }
    return (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
            {status}
        </span>
    )
}

function Tables({ search, sortBy, page, setPage, perPage }) {
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
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left border-b border-gray-200">
                        <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Hospital ID</th>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Patient's Name</th>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Phone Number</th>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Next Delivery Date</th>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Location</th>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                        <th className="px-5 py-3"></th>
                    </tr>
                </thead>
                <tbody>
                    {paginated.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="px-5 py-12 text-center text-gray-400 text-sm">
                                No patients found
                            </td>
                        </tr>
                    ) : (
                        paginated.map(patient => (
                            <tr key={patient.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                <td className="px-5 py-4 text-gray-500">{patient.hospital_id}</td>
                                <td className="px-5 py-4 text-gray-800 font-medium">{patient.name}</td>
                                <td className="px-5 py-4 text-gray-500">{patient.phone_number}</td>
                                <td className="px-5 py-4 text-gray-500">{patient.next_delivery_date}</td>
                                <td className="px-5 py-4 text-gray-500">{patient.location}</td>
                                <td className="px-5 py-4">
                                    <StatusBadge status={patient.status} />
                                </td>
                                <td className="px-5 py-4">
                                    <button className="border border-gray-300 text-gray-500 text-xs px-3 py-1.5 rounded hover:bg-gray-50">
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 text-sm text-gray-400">
                <span>You are viewing {paginated.length} out of {filtered.length} patients</span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 rounded hover:bg-gray-100 disabled:opacity-40 text-gray-500"
                    >
                        Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                        <button
                            key={n}
                            onClick={() => setPage(n)}
                            className={`w-7 h-7 rounded text-xs font-medium ${
                                page === n
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                            {n}
                        </button>
                    ))}
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 rounded hover:bg-gray-100 disabled:opacity-40 text-gray-500"
                    >
                        Next
                    </button>
                </div>
            </div>
        </>
    )
}
