import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import MatrixRain from './components/MatrixRain'
import Home from './pages/Home'
import Analysis from './pages/Analysis'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <MatrixRain />
        <Header />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analisis" element={<Analysis />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  )
}

export default App
