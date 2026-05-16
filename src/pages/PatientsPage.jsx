import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PatientsPage() {
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('')

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Navbar */}
            <nav className="flex items-center justify-between px-8 py-4 bg-white border-b shadow-sm">
                <div className="text-blue-600 font-bold text-xl">+</div>

                <div className="flex gap-6">
                    <a className="text-gray-500 hover:text-blue-600 text-sm font-medium" href="#">Overview</a>
                    <a className="text-gray-500 hover:text-blue-600 text-sm font-medium" href="#">Deliveries</a>
                    <a className="text-blue-600 text-sm font-medium border-b-2 border-blue-600 pb-1" href="#">Patients</a>
                    <a className="text-gray-500 hover:text-blue-600 text-sm font-medium" href="#">Dispatch Riders</a>
                    <a className="text-gray-500 hover:text-blue-600 text-sm font-medium" href="#">Admin</a>
                </div>

                <div
                    onClick={() => navigate('/login')}
                    className="bg-blue-600 text-white rounded-full w-9 h-9 flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                    T
                </div>
            </nav>

            {/* Heading */}
            <div className="flex items-center justify-between px-8 py-6">
                <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    + Add Patient
                </button>
            </div>

            {/* Search and Sort */}
            <div className="flex items-center justify-between px-8 pb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    Sort by:
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="">--</option>
                        <option value="name">Name</option>
                        <option value="hospital_id">Hospital ID</option>
                    </select>
                </div>
                <input
                    type="text"
                    placeholder="Search Patients"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-md px-4 py-2 text-sm w-64 outline-none focus:border-blue-500"
                />
            </div>

            {/* Table */}
            <Tables search={search} sortBy={sortBy} />

        </div>
    )
}

function Tables({ search, sortBy }) {
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

    return (
        <div className="px-8">
            <table className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
                <thead>
                    <tr className="bg-gray-50 text-left text-sm text-gray-500 font-medium border-b">
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Hospital ID</th>
                        <th className="px-6 py-3">Phone</th>
                        <th className="px-6 py-3">Next Delivery</th>
                        <th className="px-6 py-3">Location</th>
                        <th className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="px-6 py-10 text-center text-gray-400 text-sm">
                                No patients found
                            </td>
                        </tr>
                    ) : (
                        filtered.map(patient => (
                            <tr key={patient.id} className="border-b last:border-0 hover:bg-gray-50 text-sm">
                                <td className="px-6 py-4 font-medium text-gray-800">{patient.name}</td>
                                <td className="px-6 py-4 text-gray-500">{patient.hospital_id}</td>
                                <td className="px-6 py-4 text-gray-500">{patient.phone_number}</td>
                                <td className="px-6 py-4 text-gray-500">{patient.next_delivery_date}</td>
                                <td className="px-6 py-4 text-gray-500">{patient.location}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        patient.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-600'
                                    }`}>
                                        {patient.status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}
