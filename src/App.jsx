import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import MatrixRain from './components/MatrixRain'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Analysis from './pages/Analysis'
import Login from './pages/Login'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <MatrixRain />
          <Header />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/analisis"
                element={
                  <ProtectedRoute>
                    <Analysis />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
