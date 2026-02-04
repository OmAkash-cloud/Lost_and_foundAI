import React, { useState, useEffect } from 'react'
import { Search, Eye, Clock, Box, Upload, Shield, QrCode, Smartphone, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'

const Home = () => {
    const [showQR, setShowQR] = useState(false)
    const [appUrl, setAppUrl] = useState('')
    const [localIP, setLocalIP] = useState('')

    useEffect(() => {
        // Get current URL
        const currentUrl = window.location.origin
        setAppUrl(currentUrl)

        // Try to detect local IP for mobile access
        const hostname = window.location.hostname
        const port = window.location.port || '5173'
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // Try to get IP from WebRTC
            getLocalIP().then(ip => {
                if (ip) {
                    setLocalIP(`http://${ip}:${port}`)
                }
            })
        } else {
            setLocalIP(currentUrl)
        }
    }, [])

    // Function to get local IP using WebRTC
    const getLocalIP = () => {
        return new Promise((resolve) => {
            const RTCPeerConnection = window.RTCPeerConnection || 
                                     window.mozRTCPeerConnection || 
                                     window.webkitRTCPeerConnection;
            
            if (!RTCPeerConnection) {
                resolve(null);
                return;
            }

            const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            pc.createDataChannel('');
            
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    const candidate = event.candidate.candidate;
                    const match = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
                    if (match) {
                        const ip = match[1];
                        if (ip !== '127.0.0.1' && !ip.startsWith('169.254')) {
                            pc.close();
                            resolve(ip);
                            return;
                        }
                    }
                }
            };

            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .catch(() => resolve(null));

            setTimeout(() => {
                pc.close();
                resolve(null);
            }, 3000);
        });
    };

    const qrUrl = localIP || appUrl

    return (
        <div className="min-h-screen bg-white">
            {/* QR Code Section - Top */}
            {showQR && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div className="bg-white border-2 sm:border-4 border-black p-4 sm:p-6 md:p-8 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative">
                        <button
                            onClick={() => setShowQR(false)}
                            className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 hover:bg-gray-100 transition-colors"
                        >
                            <X className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
                        </button>
                        
                        <div className="text-center mb-4 sm:mb-6">
                            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <QrCode className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase">SCAN TO OPEN APP</h2>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600">
                                Scan with your phone camera to open the app
                            </p>
                        </div>

                        {qrUrl ? (
                            <div className="bg-white border-2 border-black p-4 sm:p-6 mb-4 flex flex-col items-center">
                                <div className="bg-white p-2 sm:p-3 border-2 border-black mb-3 sm:mb-4">
                                    <QRCodeSVG 
                                        value={qrUrl} 
                                        size={200}
                                        level="H"
                                        includeMargin={true}
                                        className="w-full max-w-[200px] h-auto"
                                    />
                                </div>
                                <div className="bg-primary border-2 border-black p-2 sm:p-3 w-full">
                                    <p className="text-xs font-bold uppercase text-black mb-1">URL</p>
                                    <p className="text-xs sm:text-sm font-mono text-black break-all text-center">
                                        {qrUrl}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-yellow-50 border-2 border-yellow-500 p-4 text-center">
                                <p className="text-xs sm:text-sm text-yellow-700">
                                    Loading QR code...
                                </p>
                            </div>
                        )}

                        <div className="bg-blue-50 border-2 border-blue-500 p-3 sm:p-4">
                            <div className="flex items-start gap-2 mb-2">
                                <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-blue-700 flex-shrink-0 mt-0.5" />
                                <div className="text-xs sm:text-sm text-blue-700">
                                    <p className="font-bold mb-1">Instructions:</p>
                                    <ol className="list-decimal list-inside space-y-1 text-left">
                                        <li>Make sure your phone and computer are on the same WiFi</li>
                                        <li>Open your phone's camera app</li>
                                        <li>Point it at the QR code</li>
                                        <li>Tap the notification to open</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Code Section - Top Banner */}
            <div className="bg-primary border-b-2 border-black">
                <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
                            <div>
                                <p className="text-xs sm:text-sm font-black uppercase text-black">SCAN TO OPEN ON PHONE</p>
                                <p className="text-xs text-gray-700">No installation required</p>
                            </div>
                        </div>
                        {qrUrl ? (
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="bg-white border-2 border-black p-1.5 sm:p-2">
                                    <QRCodeSVG 
                                        value={qrUrl} 
                                        size={60}
                                        level="H"
                                        includeMargin={false}
                                        className="w-[60px] h-[60px]"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowQR(true)}
                                    className="bg-black text-white border-2 border-black px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-black uppercase tracking-wide hover:bg-gray-800 transition-all flex items-center gap-1.5 sm:gap-2"
                                >
                                    <Smartphone className="h-3 w-3 sm:h-4 sm:w-4" />
                                    VIEW FULL QR
                                </button>
                            </div>
                        ) : (
                            <div className="text-xs text-gray-600">Loading...</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Hero Section */}
            <section className="container mx-auto px-4 sm:px-6 py-6 sm:py-12 relative">
                <div className="grid lg:grid-cols-2 gap-6 sm:gap-12 items-start">
                    {/* Left Section - Search */}
                    <div className="space-y-4 sm:space-y-8 relative z-10">
                        {/* Headline */}
                        <div>
                            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-none mb-2 sm:mb-4">
                                <span className="text-black">LOST</span>
                                <br />
                                <span className="text-primary">SOMETHING?</span>
                            </h1>
                            <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-lg mt-4 sm:mt-6">
                                Our AI-powered platform helps you find lost items and report found items. Get started by choosing an action below.
                            </p>
                        </div>
                    </div>

                    {/* Right Section - Statistics */}
                    <div className="space-y-4 sm:space-y-6 relative mt-6 lg:mt-0">
                        {/* Diagonal Stripes Background */}
                        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
                            backgroundImage: 'repeating-linear-gradient(45deg, #E5E5E5, #E5E5E5 10px, transparent 10px, transparent 20px)',
                            backgroundSize: '28px 28px'
                        }}></div>
                        <div className="relative z-10">
                            {/* Large Yellow Card */}
                            <div className="bg-primary border-2 border-black p-4 sm:p-6 md:p-8">
                                <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-2 border-black rounded-full flex items-center justify-center">
                                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-black" fill="black" />
                                    </div>
                                </div>
                                <div className="text-4xl sm:text-5xl md:text-6xl font-black text-black mb-1 sm:mb-2">95%</div>
                                <div className="text-xs sm:text-sm font-bold uppercase tracking-wide text-black">RECOVERY RATE</div>
                            </div>

                            {/* Two Smaller Cards */}
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                                {/* White Card */}
                                <div className="bg-white border-2 border-black p-4 sm:p-5 md:p-6">
                                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-black rounded-full flex items-center justify-center">
                                            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-accent" fill="#FFA500" />
                                        </div>
                                    </div>
                                    <div className="text-2xl sm:text-3xl md:text-4xl font-black text-black mb-1 sm:mb-2">&lt;24H</div>
                                    <div className="text-xs font-bold uppercase tracking-wide text-black">AVG MATCH</div>
                                </div>

                                {/* Black Card */}
                                <div className="bg-black border-2 border-black p-4 sm:p-5 md:p-6">
                                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white rounded-full flex items-center justify-center">
                                            <Box className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="white" />
                                        </div>
                                    </div>
                                    <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1 sm:mb-2">10K+</div>
                                    <div className="text-xs font-bold uppercase tracking-wide text-white">RETURNED</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Action Cards Section */}
            <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
                <div className="mb-6 sm:mb-8">
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">TAKE ACTION</div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black uppercase leading-none">
                            <span className="text-black">HOW CAN WE</span>
                            <br />
                            <span className="text-primary">HELP YOU?</span>
                        </h2>
                        <p className="text-gray-600 text-sm sm:text-base max-w-md sm:text-right">
                            Choose an action below to get started. Our AI will guide you through the process.
                        </p>
                    </div>
                </div>

                {/* Three Action Cards */}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-12">
                    {/* Card 1 - Report Lost (Yellow) */}
                    <Link 
                        to={localStorage.getItem('isLoggedIn') === 'true' ? "/report-lost" : "/login"} 
                        className="bg-primary border-2 border-black p-4 sm:p-6 md:p-8 hover:scale-105 transition-transform relative group"
                    >
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-300 opacity-30">01</div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-2 border-black bg-white flex items-center justify-center mb-4 sm:mb-6">
                                <Search className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-black" />
                            </div>
                            <h3 className="text-lg sm:text-xl md:text-2xl font-black uppercase mb-2 sm:mb-4">REPORT LOST</h3>
                            <p className="text-black text-xs sm:text-sm leading-relaxed">
                                Lost something? Report your item and get notified when a match is found.
                            </p>
                        </div>
                    </Link>

                    {/* Card 2 - Report Found (White) */}
                    <Link 
                        to={localStorage.getItem('isLoggedIn') === 'true' ? "/report-found" : "/login"} 
                        className="bg-white border-2 border-black p-4 sm:p-6 md:p-8 hover:scale-105 transition-transform relative group"
                    >
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-300 opacity-30">02</div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-2 border-black bg-white flex items-center justify-center mb-4 sm:mb-6">
                                <Upload className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-black" />
                            </div>
                            <h3 className="text-lg sm:text-xl md:text-2xl font-black uppercase mb-2 sm:mb-4">REPORT FOUND</h3>
                            <p className="text-black text-xs sm:text-sm leading-relaxed">
                                Found an item? Help reunite it with the owner by reporting it here.
                            </p>
                        </div>
                    </Link>

                    {/* Card 3 - Claim Item (Black) */}
                    <Link 
                        to={localStorage.getItem('isLoggedIn') === 'true' ? "/claim-item" : "/login"} 
                        className="bg-black border-2 border-black p-4 sm:p-6 md:p-8 hover:scale-105 transition-transform relative group sm:col-span-2 md:col-span-1"
                    >
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-300 opacity-30">03</div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-2 border-white bg-black flex items-center justify-center mb-4 sm:mb-6">
                                <Shield className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl md:text-2xl font-black uppercase mb-2 sm:mb-4 text-white">CLAIM ITEM</h3>
                            <p className="text-white text-xs sm:text-sm leading-relaxed">
                                Spotted your item? Verify ownership and claim it securely.
                            </p>
                        </div>
                    </Link>
                </div>
            </section>
        </div>
    )
}

export default Home
