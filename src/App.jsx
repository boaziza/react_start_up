import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import PatientsPage from './pages/PatientsPage'
import ViewPatient from './pages/ViewPatient'
import AssignPackage from './pages/AssignPackage'
import DeliveriesPage from './pages/DeliveriesPage'
import RidersPage from './pages/RidersPage'


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/" element={<SignupPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/ViewPatient/:id" element={<ViewPatient />} />
        <Route path="/patients/ViewPatient/:id/AssignPackage" element={<AssignPackage />} />
        <Route path="/deliveries" element={<DeliveriesPage />} />
        <Route path="/dispatchRiders" element={<RidersPage />} />
      </Routes>
    </BrowserRouter>
  )
}
