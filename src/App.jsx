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

function App() {
  return (
    <AuthProvider>
      <AnalysisProvider>
        <Router>
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
