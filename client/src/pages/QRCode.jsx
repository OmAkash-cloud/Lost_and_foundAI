import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode as QrCodeIcon, Smartphone, Wifi } from 'lucide-react';

const QRCodePage = () => {
    const [localUrl, setLocalUrl] = useState('');
    const [localIP, setLocalIP] = useState('');
    const [manualIP, setManualIP] = useState('');
    const [detectedIP, setDetectedIP] = useState('');

    useEffect(() => {
        // Get current URL
        const currentUrl = window.location.origin;
        setLocalUrl(currentUrl);

        // Try to get local IP address
        const hostname = window.location.hostname;
        const port = window.location.port || '5173';
        
        // If hostname is localhost, try to detect local IP
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // Try to get IP from WebRTC
            getLocalIP().then(ip => {
                if (ip) {
                    setDetectedIP(ip);
                    setLocalIP(`http://${ip}:${port}`);
                } else {
                    // Show placeholder
                    setLocalIP('');
                }
            });
        } else {
            // Already using IP address (server running with --host)
            setLocalIP(currentUrl);
            setDetectedIP(hostname);
        }
    }, []);

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
                        // Filter out localhost and invalid IPs
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

            // Timeout after 3 seconds
            setTimeout(() => {
                pc.close();
                resolve(null);
            }, 3000);
        });
    };

    const handleManualIPChange = (e) => {
        const ip = e.target.value.trim();
        setManualIP(ip);
        if (ip) {
            const port = window.location.port || '5173';
            setLocalIP(`http://${ip}:${port}`);
        } else if (detectedIP) {
            const port = window.location.port || '5173';
            setLocalIP(`http://${detectedIP}:${port}`);
        } else {
            setLocalIP('');
        }
    };

    const qrUrl = localIP || (manualIP ? `http://${manualIP}:${window.location.port || '5173'}` : '');

    return (
        <div className="min-h-screen bg-white p-4 sm:p-6 md:p-10">
            <div className="max-w-2xl mx-auto border-2 sm:border-4 border-black p-4 sm:p-6 md:p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-center mb-6 sm:mb-8">
                    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                        <QrCodeIcon className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-black" />
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase">Scan to Open App</h1>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base md:text-lg">
                        Scan this QR code with your phone to open the app
                    </p>
                </div>

                {/* Manual IP Input */}
                {!detectedIP && (
                    <div className="bg-yellow-50 border-2 border-yellow-500 p-3 sm:p-4 mb-4 sm:mb-6">
                        <label className="block text-xs sm:text-sm font-black uppercase text-black mb-2">
                            Enter Your Computer's IP Address:
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                value={manualIP}
                                onChange={handleManualIPChange}
                                placeholder="192.168.1.100"
                                className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm border-2 border-black font-mono"
                            />
                            <span className="px-3 sm:px-4 py-2 border-2 border-black bg-white font-mono text-xs sm:text-sm whitespace-nowrap">
                                :{window.location.port || '5173'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2 break-words">
                            Find your IP: <strong>Windows:</strong> <code className="bg-yellow-100 px-1">ipconfig</code> | 
                            <strong> Mac/Linux:</strong> <code className="bg-yellow-100 px-1">ifconfig</code>
                        </p>
                    </div>
                )}

                {/* QR Code */}
                {qrUrl ? (
                    <div className="bg-white border-2 sm:border-4 border-black p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 flex flex-col items-center">
                        <div className="bg-white p-2 sm:p-4 border-2 border-black mb-3 sm:mb-4">
                            <QRCodeSVG 
                                value={qrUrl} 
                                size={200}
                                level="H"
                                includeMargin={true}
                                className="sm:w-64 sm:h-64 md:w-80 md:h-80"
                            />
                        </div>
                        <div className="bg-primary border-2 border-black p-3 sm:p-4 w-full max-w-md">
                            <p className="text-xs font-bold uppercase text-black mb-1 sm:mb-2">URL</p>
                            <p className="text-xs sm:text-sm font-mono text-black break-all text-center">
                                {qrUrl}
                            </p>
                        </div>
                        <div className="mt-3 sm:mt-4 bg-green-50 border-2 border-green-500 p-2 sm:p-3 w-full max-w-md">
                            <p className="text-xs text-green-700 text-center">
                                ✅ Test this URL on your phone's browser first to make sure it works!
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-red-50 border-2 sm:border-4 border-red-500 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 text-center">
                        <p className="text-red-700 text-sm sm:text-base font-bold uppercase mb-2">
                            ⚠️ No URL Available
                        </p>
                        <p className="text-xs sm:text-sm text-red-600">
                            Please enter your computer's IP address above to generate QR code
                        </p>
                    </div>
                )}

                {/* Instructions */}
                <div className="space-y-3 sm:space-y-4">
                    <div className="bg-yellow-50 border-2 border-yellow-500 p-3 sm:p-4">
                        <h3 className="text-sm sm:text-base font-black uppercase text-black mb-2 flex items-center gap-2">
                            <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" />
                            Instructions
                        </h3>
                        <ol className="list-decimal list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
                            <li>Make sure your phone and computer are on the same WiFi network</li>
                            <li>Open your phone's camera app or QR code scanner</li>
                            <li>Point it at the QR code above</li>
                            <li>Tap the notification to open the app in your browser</li>
                        </ol>
                    </div>

                    {detectedIP && (
                        <div className="bg-green-50 border-2 border-green-500 p-3 sm:p-4">
                            <h3 className="text-sm sm:text-base font-black uppercase text-green-700 mb-2 flex items-center gap-2">
                                <Wifi className="h-4 w-4 sm:h-5 sm:w-5" />
                                IP Detected
                            </h3>
                            <p className="text-xs sm:text-sm text-green-700 break-words">
                                Detected IP: <code className="bg-green-100 px-1 sm:px-2 py-1 font-mono text-xs sm:text-sm">{detectedIP}</code>
                            </p>
                        </div>
                    )}

                    <div className="bg-blue-50 border-2 border-blue-500 p-3 sm:p-4">
                        <h3 className="text-sm sm:text-base font-black uppercase text-blue-700 mb-2">Server Command</h3>
                        <p className="text-xs sm:text-sm text-blue-700 mb-2">
                            Make sure your dev server is running with network access:
                        </p>
                        <code className="block bg-blue-100 p-2 text-xs sm:text-sm font-mono text-blue-900 break-all">
                            npm run dev -- --host
                        </code>
                        <p className="text-xs text-blue-600 mt-2 break-words">
                            Or update <code className="bg-blue-100 px-1">vite.config.js</code> to include <code className="bg-blue-100 px-1">server: &#123; host: '0.0.0.0' &#125;</code>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRCodePage;
