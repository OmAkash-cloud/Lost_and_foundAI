import React from 'react'
import { MapPin, Zap, Shield, Clock, Users, Globe, QrCode, Brain } from 'lucide-react'

const About = () => {
    const keyFeatures = [
        {
            icon: QrCode,
            title: 'QR-Based Discovery',
            description: 'QR codes placed at notice boards, security desks, and cafeterias for instant access without app installation.',
        },
        {
            icon: Brain,
            title: 'AI Match Score System',
            description: 'Advanced AI compares descriptions, images, location, and time to generate similarity scores and suggest matches.',
        },
        {
            icon: Shield,
            title: 'Proof-of-Ownership Verification',
            description: 'Anti-fraud feature that verifies ownership through hidden marks, item-specific details, or private images.',
        },
        {
            icon: Globe,
            title: 'Smart Lost Zones',
            description: 'AI heatmap analytics identify high-risk areas where items are frequently lost for preventive measures.',
        },
        {
            icon: Clock,
            title: 'Real-Time Smart Alerts',
            description: 'Automatic notifications via email when potential matches are found, eliminating manual checking.',
        },
        {
            icon: Shield,
            title: 'Secure Handover Token',
            description: 'One-time QR code or OTP generated after verification for secure physical handover.',
        },
        {
            icon: Users,
            title: 'Trust & Reputation System',
            description: 'Earn trust points and badges like "Verified Helper" or "Community Guardian" for honest behavior.',
        },
    ]

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
                <div className="mb-6 sm:mb-8 md:mb-12 text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black uppercase mb-2 sm:mb-4">
                        <span className="text-black">ABOUT</span>
                        <br />
                        <span className="text-primary">FINDORA</span>
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-3xl mx-auto mt-4 sm:mt-6 px-2">
                        A revolutionary AI-powered platform designed to reunite lost items with their owners through intelligent matching, secure verification, and community collaboration.
                    </p>
                </div>

                {/* Key Features */}
                <div className="mb-8 sm:mb-12 md:mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase mb-4 sm:mb-6 md:mb-8 text-center">KEY FEATURES</h2>
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {keyFeatures.map((feature, index) => {
                            const Icon = feature.icon
                            return (
                                <div
                                    key={index}
                                    className="bg-white border-2 border-black p-4 sm:p-5 md:p-6 hover:bg-primary transition-colors"
                                >
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-black bg-white flex items-center justify-center mb-3 sm:mb-4">
                                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-black uppercase mb-2 sm:mb-3">{feature.title}</h3>
                                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* System Workflow */}
                <div className="mb-8 sm:mb-12 md:mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase mb-4 sm:mb-6 md:mb-8 text-center">HOW IT WORKS</h2>
                    <div className="space-y-4 sm:space-y-6">
                        {[
                            { step: '01', title: 'Item Found', desc: 'Finder scans QR code or accesses web app' },
                            { step: '02', title: 'Reporting', desc: 'Found item reported with details and images' },
                            { step: '03', title: 'Lost Item Report', desc: 'Owner reports lost item with relevant details' },
                            { step: '04', title: 'AI Matching', desc: 'AI engine calculates match scores and suggests matches' },
                            { step: '05', title: 'Claiming', desc: 'User submits claim request, item is temporarily locked' },
                            { step: '06', title: 'Verification', desc: 'Ownership proof verified through AI validation' },
                            { step: '07', title: 'Secure Handover', desc: 'One-time QR/OTP generated for physical handover' },
                            { step: '08', title: 'Recovery', desc: 'Item returned, status updated, trust scores updated' },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:gap-6 p-4 sm:p-5 md:p-6 border-2 border-black bg-white hover:bg-primary transition-colors"
                            >
                                <div className="text-3xl sm:text-4xl font-black text-primary flex-shrink-0">{item.step}</div>
                                <div className="flex-1">
                                    <h3 className="text-lg sm:text-xl font-black uppercase mb-1 sm:mb-2">{item.title}</h3>
                                    <p className="text-gray-700 text-sm sm:text-base">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tech Stack */}
                <div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase mb-4 sm:mb-6 md:mb-8 text-center">TECH STACK</h2>
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="bg-primary border-2 border-black p-4 sm:p-5 md:p-6">
                            <h3 className="text-xl sm:text-2xl font-black uppercase mb-3 sm:mb-4">FRONTEND</h3>
                            <ul className="space-y-1 sm:space-y-2 text-black text-sm sm:text-base font-bold">
                                <li>• React.js</li>
                                <li>• Tailwind CSS</li>
                            </ul>
                        </div>
                        <div className="bg-black border-2 border-black p-4 sm:p-5 md:p-6 text-white">
                            <h3 className="text-xl sm:text-2xl font-black uppercase mb-3 sm:mb-4">AI & MATCHING</h3>
                            <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base font-bold">
                                <li>• Python</li>
                                <li>• FastAPI</li>
                                <li>• Scikit-learn</li>
                            </ul>
                        </div>
                        <div className="bg-white border-2 border-black p-4 sm:p-5 md:p-6">
                            <h3 className="text-xl sm:text-2xl font-black uppercase mb-3 sm:mb-4">AUTHENTICATION</h3>
                            <ul className="space-y-1 sm:space-y-2 text-black text-sm sm:text-base font-bold">
                                <li>• Firebase Authentication</li>
                                <li>• Google Login</li>
                            </ul>
                        </div>
                        <div className="bg-light border-2 border-black p-4 sm:p-5 md:p-6">
                            <h3 className="text-xl sm:text-2xl font-black uppercase mb-3 sm:mb-4">NOTIFICATIONS & MAPS</h3>
                            <ul className="space-y-1 sm:space-y-2 text-black text-sm sm:text-base font-bold">
                                <li>• Firebase Cloud Messaging</li>
                                <li>• Google Maps API</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default About
