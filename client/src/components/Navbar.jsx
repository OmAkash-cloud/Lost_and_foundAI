import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MapPin, Zap } from 'lucide-react'

const Navbar = () => {
    const location = useLocation()

    return (
        <nav className="bg-white border-b-2 border-black">
            <div className="container mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                <div className="flex justify-between items-center gap-2 sm:gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-primary border-2 border-black flex items-center justify-center">
                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-black" fill="black" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg sm:text-xl md:text-2xl text-black tracking-tight">FINDORA</span>
                            <span className="text-[10px] sm:text-xs text-gray-600 font-medium">AI POWERED</span>
                        </div>
                    </Link>

                    {/* Navigation Links - Hidden on mobile */}
                    <div className="hidden sm:flex items-center gap-4 md:gap-8">
                        <Link
                            to="/about"
                            className={`font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors ${location.pathname === '/about' ? 'text-black' : 'text-black hover:text-primary'
                                }`}
                        >
                            ABOUT
                        </Link>
                        {!localStorage.getItem('isLoggedIn') && (
                            <Link
                                to="/login"
                                className="font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors text-black hover:text-primary"
                            >
                                LOGIN
                            </Link>
                        )}
                    </div>

                    {/* Get Started Button */}
                    <Link
                        to="/report-lost"
                        className="bg-black text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1 sm:gap-2 border-2 border-black hover:bg-primary hover:text-black transition-all whitespace-nowrap"
                    >
                        <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">GET STARTED</span>
                        <span className="sm:hidden">START</span>
                    </Link>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
