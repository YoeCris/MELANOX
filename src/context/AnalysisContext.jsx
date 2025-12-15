import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

/**
 * AnalysisContext - Manages analysis count and free trial logic
 * 
 * Provides:
 * - analysisCount: Number of analyses performed (for anonymous users)
 * - canAnalyze: Whether user can perform analysis
 * - incrementAnalysisCount: Increment count after analysis
 * - showLoginPrompt: Whether to show login modal
 * - setShowLoginPrompt: Control login modal visibility
 */

const AnalysisContext = createContext({})

export const useAnalysis = () => {
    const context = useContext(AnalysisContext)
    if (!context) {
        throw new Error('useAnalysis must be used within AnalysisProvider')
    }
    return context
}

export const AnalysisProvider = ({ children }) => {
    const { user } = useAuth()
    const [analysisCount, setAnalysisCount] = useState(0)
    const [showLoginPrompt, setShowLoginPrompt] = useState(false)

    // Load analysis count from localStorage on mount
    useEffect(() => {
        const count = parseInt(localStorage.getItem('analysis_count') || '0')
        setAnalysisCount(count)
    }, [])

    /**
     * Check if user can perform analysis
     * - Logged in users: unlimited
     * - Anonymous users: 1 free analysis
     */
    const canAnalyze = () => {
        if (user) return true // Logged in users have unlimited analyses
        return analysisCount < 1 // Anonymous users get 1 free analysis
    }

    /**
     * Increment analysis count and show login prompt if needed
     */
    const incrementAnalysisCount = () => {
        if (user) return // Don't count for logged in users

        const newCount = analysisCount + 1
        setAnalysisCount(newCount)
        localStorage.setItem('analysis_count', newCount.toString())

        // Show login prompt after first free analysis
        if (newCount >= 1) {
            setShowLoginPrompt(true)
        }
    }

    /**
     * Reset analysis count (for testing or after login)
     */
    const resetAnalysisCount = () => {
        setAnalysisCount(0)
        localStorage.removeItem('analysis_count')
        setShowLoginPrompt(false)
    }

    const value = {
        analysisCount,
        canAnalyze,
        incrementAnalysisCount,
        resetAnalysisCount,
        showLoginPrompt,
        setShowLoginPrompt
    }

    return (
        <AnalysisContext.Provider value={value}>
            {children}
        </AnalysisContext.Provider>
    )
}
