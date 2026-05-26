import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import PatientsPage from './pages/PatientsPage'
import ViewPatient from './pages/viewPatient'
import AssignPackage from './pages/AssignPackage'
import DeliveriesPage from './pages/DeliveriesPage'
import RidersPage from './pages/RidersPage'

function ProtectedRoute({ children }) {
  const user = localStorage.getItem('user')
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/"      element={<SignupPage />} />

        {/* Protected routes */}
        <Route path="/patients" element={
          <ProtectedRoute><PatientsPage /></ProtectedRoute>
        } />
        <Route path="/patients/ViewPatient/:id" element={
          <ProtectedRoute><ViewPatient /></ProtectedRoute>
        } />
        <Route path="/patients/ViewPatient/:id/AssignPackage" element={
          <ProtectedRoute><AssignPackage /></ProtectedRoute>
        } />
        <Route path="/deliveries" element={
          <ProtectedRoute><DeliveriesPage /></ProtectedRoute>
        } />
        <Route path="/dispatchRiders" element={
          <ProtectedRoute><RidersPage /></ProtectedRoute>
        } />

        {/* Catch-all → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
