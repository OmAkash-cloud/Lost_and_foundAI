import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
    const location = useLocation()
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const userPhone = localStorage.getItem('userPhone')

    // Check if user is logged in (has phone number)
    if (!isLoggedIn || !userPhone) {
        // Redirect to login with return URL
        return <Navigate to="/login" state={{ from: location.pathname }} replace />
    }

    return children
}

export default ProtectedRoute
