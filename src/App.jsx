import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import PatientsPage from './pages/PatientsPage'


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/" element={<SignupPage />} />
        <Route path="/patients" element={<PatientsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
