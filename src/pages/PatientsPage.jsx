import { useState } from 'react'
import { useNavigate } from "react-router-dom";


export default function PatientsPage() {
    const [patients, setPatients] = useState([])
    return (
        <div>
            <h1>Patients</h1>
            <button id="add-patient"> + Add Patient</button>
            <div className="sort">
                Sort by:
                <span id="sort-patients"></span>
            </div>    
            <input 
            type="text"
            placeholder="Search Patients"
            id="search-patients"
             /> 
        </div>
    )
}