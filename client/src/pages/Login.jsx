import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Phone, ArrowRight } from 'lucide-react'

const Login = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [phoneNumber, setPhoneNumber] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // If already logged in, redirect to home or intended page
    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
        const userPhone = localStorage.getItem('userPhone')
        
        if (isLoggedIn && userPhone) {
            // Redirect to the page they were trying to access, or home
            const from = location.state?.from || '/'
            navigate(from, { replace: true })
        }
    }, [navigate, location])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Validate phone number
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/
        const cleanedPhone = phoneNumber.replace(/\D/g, '') // Remove non-digits

        if (!phoneNumber.trim()) {
            setError('Please enter your phone number')
            setLoading(false)
            return
        }

        if (cleanedPhone.length < 10) {
            setError('Please enter a valid phone number (at least 10 digits)')
            setLoading(false)
            return
        }

        try {
            // Store phone number in localStorage
            localStorage.setItem('userPhone', phoneNumber)
            localStorage.setItem('userPhoneCleaned', cleanedPhone)

            // Get or create user ID
            let userId = localStorage.getItem('userId')
            if (!userId) {
                userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                localStorage.setItem('userId', userId)
            }

            // Store login status
            localStorage.setItem('isLoggedIn', 'true')
            localStorage.setItem('loginTime', Date.now().toString())

            console.log('✅ User logged in with phone:', phoneNumber)

            // Redirect to the page they were trying to access, or home
            const from = location.state?.from || '/'
            navigate(from, { replace: true })
        } catch (err) {
            console.error('Login error:', err)
            setError('Failed to login. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
            <div className="max-w-md w-full">
                <div className="bg-white border-2 sm:border-4 border-black p-6 sm:p-8 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    {/* Header */}
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-black bg-primary flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <Phone className="h-8 w-8 sm:h-10 sm:w-10 text-black" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase mb-2 sm:mb-4">
                            <span className="text-black">LOGIN</span>
                            <br />
                            <span className="text-primary">WITH PHONE</span>
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Enter your phone number to get started. This will be used to contact you when your lost item is found.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div>
                            <label className="block text-xs sm:text-sm font-black uppercase tracking-wide mb-2">
                                PHONE NUMBER <span className="text-red-600">*</span>
                            </label>
                            <div className="flex items-center gap-2 border-2 border-black p-3 sm:p-4 bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
                                <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => {
                                        // Allow digits, spaces, dashes, parentheses, and + sign
                                        const value = e.target.value
                                        setPhoneNumber(value)
                                    }}
                                    placeholder="+1 (555) 123-4567"
                                    className="flex-1 text-sm sm:text-base font-bold focus:outline-none bg-transparent"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="mt-2 bg-blue-50 border-2 border-blue-200 p-2 sm:p-3">
                                <p className="text-xs sm:text-sm text-blue-700 font-medium">
                                    📱 <strong>Important:</strong> Your phone number will be displayed to users who search for items matching your found items, so they can contact you directly.
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-100 border-2 border-red-500 p-3 sm:p-4 text-red-700 font-bold uppercase text-xs sm:text-sm break-words">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary border-2 border-black py-3 sm:py-4 text-sm sm:text-base font-black uppercase hover:bg-accent transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? 'LOGGING IN...' : (
                                <>
                                    CONTINUE
                                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Info */}
                    <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t-2 border-gray-200">
                        <p className="text-xs text-gray-600 text-center">
                            By continuing, you agree to share your phone number with users who find items matching your lost item reports.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
