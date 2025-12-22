import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AnalysisProvider } from './context/AnalysisContext'
import Header from './components/Header'
import Footer from './components/Footer'
import MatrixRain from './components/MatrixRain'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Analysis from './pages/Analysis'
import Login from './pages/Login'
import MyAnalyses from './pages/MyAnalyses'
import AdminDashboard from './pages/AdminDashboard'
import DoctorsList from './pages/DoctorsList'
import ConsultationForm from './pages/ConsultationForm'
import MyConsultations from './pages/MyConsultations'
import DoctorPanel from './pages/DoctorPanel'
import AdminDoctors from './pages/AdminDoctors'
import DoctorForm from './pages/DoctorForm'

function App() {
  return (
    <AuthProvider>
      <AnalysisProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="app">
            <MatrixRain />
            <Header />

            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/analisis" element={<Analysis />} />
                <Route
                  path="/mis-analisis"
                  element={
                    <ProtectedRoute>
                      <MyAnalyses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/doctores"
                  element={
                    <ProtectedRoute>
                      <AdminDoctors />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/doctor/new"
                  element={
                    <ProtectedRoute>
                      <DoctorForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/doctor/edit/:id"
                  element={
                    <ProtectedRoute>
                      <DoctorForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consultar-doctor"
                  element={
                    <ProtectedRoute>
                      <DoctorsList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/nueva-consulta"
                  element={
                    <ProtectedRoute>
                      <ConsultationForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mis-consultas"
                  element={
                    <ProtectedRoute>
                      <MyConsultations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/casos"
                  element={
                    <ProtectedRoute>
                      <DoctorPanel />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>

            <Footer />
          </div>
        </Router>
      </AnalysisProvider>
    </AuthProvider>
  )
}

export default App
