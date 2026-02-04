import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './src/pages/Home'
import About from './src/pages/About'
import Login from './src/pages/Login'
import ReportLost from './src/pages/ReportLost'
import ReportFound from './src/pages/ReportFound'
import ClaimItem from './src/pages/ClaimItem'
import QRCodePage from './src/pages/QRCode'
import Navbar from './src/components/Navbar'
import ProtectedRoute from './src/components/ProtectedRoute'
import { db } from './src/firebase'

function App() {
    useEffect(() => {
        // Test Firebase connection on app startup
        if (db) {
            console.log('✅ Firebase DB initialized:', db)
            console.log('✅ Firebase project:', db.app.options.projectId)
        } else {
            console.error('❌ Firebase DB not initialized!')
        }
    }, [])

    return (
        <div className="min-h-screen bg-white text-black">
            <Navbar />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/about" element={<About />} />

                {/* Protected Routes - Require Login */}
                <Route
                    path="/report-lost"
                    element={
                        <ProtectedRoute>
                            <ReportLost />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/report-found"
                    element={
                        <ProtectedRoute>
                            <ReportFound />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/claim-item"
                    element={
                        <ProtectedRoute>
                            <ClaimItem />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/qr-code"
                    element={
                        <ProtectedRoute>
                            <QRCodePage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </div>
    )
}

export default App
