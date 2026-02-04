import React, { useState, useRef, useEffect } from 'react'
import { Search, Upload, Camera, Package, MapPin, Calendar, CheckCircle, Phone } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'

const ReportLost = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'electronics',
        location: '',
        date: '',
        image: null,
    })
    const [showScanner, setShowScanner] = useState(false)
    const [scannedData, setScannedData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [matchingItems, setMatchingItems] = useState([])
    const [searching, setSearching] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const scannerRef = useRef(null)
    const html5QrCodeRef = useRef(null)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleFileChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] })
    }

    useEffect(() => {
        if (showScanner && scannerRef.current) {
            const html5QrCode = new Html5Qrcode('qr-reader-lost')
            html5QrCodeRef.current = html5QrCode

            html5QrCode.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                    try {
                        const data = JSON.parse(decodedText)
                        setScannedData(data)
                        setShowScanner(false)
                        html5QrCode.stop().then(() => {
                            html5QrCode.clear()
                        })
                        alert('QR Code scanned successfully! Item receipt confirmed.')
                    } catch (e) {
                        alert('Invalid QR code format')
                    }
                },
                (errorMessage) => {
                    // Ignore scanning errors
                }
            )
        }

        return () => {
            if (html5QrCodeRef.current) {
                html5QrCodeRef.current.stop().then(() => {
                    html5QrCodeRef.current.clear()
                }).catch(() => { })
            }
        }
    }, [showScanner])

    const searchMatchingItems = async (lostItemData) => {
        setSearching(true)
        try {
            const lostTitle = (lostItemData.title || '').toLowerCase().trim()
            const lostLocation = (lostItemData.location || '').toLowerCase().trim()
            const lostDescription = (lostItemData.description || '').toLowerCase()

            // Extract key words from title (remove common words)
            const commonWords = ['a', 'an', 'the', 'is', 'are', 'was', 'were', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
            const titleWords = lostTitle.split(' ').filter(word => word.length > 2 && !commonWords.includes(word))

            // Query for found items
            const foundItemsQuery = query(
                collection(db, 'items'),
                where('type', '==', 'found')
            )

            const querySnapshot = await getDocs(foundItemsQuery)
            const allFoundItems = []

            querySnapshot.forEach((doc) => {
                allFoundItems.push({
                    id: doc.id,
                    ...doc.data()
                })
            })

            // Scoring algorithm with priorities
            const scoredItems = allFoundItems.map(item => {
                const itemTitle = (item.title || '').toLowerCase().trim()
                const itemLocation = (item.location || '').toLowerCase().trim()
                const itemDescription = (item.description || '').toLowerCase()
                const itemCategory = (item.category || '').toLowerCase()

                let score = 0

                // PRIORITY 1: Title/Name matching (highest weight)
                if (lostTitle && itemTitle) {
                    // Exact title match (highest score)
                    if (itemTitle === lostTitle) {
                        score += 100
                    }
                    // Title contains lost title (high score)
                    else if (itemTitle.includes(lostTitle) || lostTitle.includes(itemTitle)) {
                        score += 80
                    }
                    // Check if key words from lost title appear in found title
                    else if (titleWords.length > 0) {
                        const matchingWords = titleWords.filter(word => itemTitle.includes(word))
                        if (matchingWords.length > 0) {
                            // Score based on percentage of matching words
                            score += (matchingWords.length / titleWords.length) * 60
                        }
                    }
                }

                // PRIORITY 2: Location matching (secondary weight)
                if (lostLocation && itemLocation) {
                    // Exact location match
                    if (itemLocation === lostLocation) {
                        score += 30
                    }
                    // Location contains lost location or vice versa
                    else if (itemLocation.includes(lostLocation) || lostLocation.includes(itemLocation)) {
                        score += 20
                    }
                    // Partial location match (check for common words)
                    else {
                        const lostLocationWords = lostLocation.split(' ').filter(w => w.length > 3)
                        const itemLocationWords = itemLocation.split(' ').filter(w => w.length > 3)
                        const locationMatches = lostLocationWords.filter(word =>
                            itemLocationWords.some(itemWord => itemWord.includes(word) || word.includes(itemWord))
                        )
                        if (locationMatches.length > 0) {
                            score += (locationMatches.length / lostLocationWords.length) * 10
                        }
                    }
                }

                // Bonus: Category match (lower weight)
                if (itemCategory === lostItemData.category.toLowerCase()) {
                    score += 5
                }

                // Bonus: Description keyword match (lowest weight, only if title matches)
                if (score > 0 && lostDescription && itemDescription) {
                    const descWords = lostDescription.split(' ').filter(word => word.length > 4)
                    const descMatches = descWords.filter(word => itemDescription.includes(word))
                    if (descMatches.length > 0) {
                        score += (descMatches.length / descWords.length) * 5
                    }
                }

                return {
                    ...item,
                    matchScore: score
                }
            })

            // Filter: Only include items with a minimum score (title match required)
            // Items must have at least some title relevance to be considered
            const matches = scoredItems.filter(item => {
                // Must have at least 20 points (some title relevance)
                return item.matchScore >= 20
            })

            // Sort by score (highest first)
            matches.sort((a, b) => {
                if (b.matchScore !== a.matchScore) {
                    return b.matchScore - a.matchScore
                }
                // If scores are equal, prioritize by exact title match
                const aExactTitle = a.title.toLowerCase().trim() === lostTitle
                const bExactTitle = b.title.toLowerCase().trim() === lostTitle
                if (aExactTitle && !bExactTitle) return -1
                if (!aExactTitle && bExactTitle) return 1
                return 0
            })

            // Limit to top 10 matches
            const topMatches = matches.slice(0, 10)

            setMatchingItems(topMatches)
            console.log(`Found ${topMatches.length} matching items (from ${allFoundItems.length} total)`)
            console.log('Top matches:', topMatches.map(m => ({ title: m.title, location: m.location, score: m.matchScore })))
        } catch (err) {
            console.error('Error searching for matches:', err)
        } finally {
            setSearching(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Check if user is logged in (has phone number)
            const userPhone = localStorage.getItem('userPhone')
            if (!userPhone) {
                const shouldLogin = window.confirm('Please login with your phone number first to report a lost item. This allows people who find your item to contact you.\n\nWould you like to go to the login page?')
                if (shouldLogin) {
                    navigate('/login')
                    return
                } else {
                    setLoading(false)
                    return
                }
            }

            // Check if Firebase is initialized
            if (!db) {
                throw new Error('Firebase database is not initialized. Please check your Firebase configuration.')
            }

            // Prepare data for Firebase
            const lostItemData = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                location: formData.location,
                date: formData.date,
                type: 'lost',
                imageName: formData.image ? formData.image.name : null,
                imageSize: formData.image ? formData.image.size : null,
                scannedData: scannedData || null,
                phoneNumber: userPhone, // Store phone number for contact
                createdAt: serverTimestamp(),
            }

            console.log('Attempting to save to Firebase:', lostItemData)

            // Save to Firebase Firestore
            const docRef = await addDoc(collection(db, 'items'), lostItemData)
            console.log('Document written with ID: ', docRef.id)

            // Set submitted state
            setSubmitted(true)

            // Search for matching found items
            await searchMatchingItems(lostItemData)

            // Success message
            alert('Lost item reported successfully! Searching for matches...')
        } catch (err) {
            console.error('Error reporting lost item:', err)
            console.error('Error code:', err.code)
            console.error('Error message:', err.message)

            let errorMessage = 'Failed to report lost item. Please try again.'

            // Provide specific error messages based on error type
            if (err.code === 'permission-denied') {
                errorMessage = 'Permission denied. Please check Firebase security rules. The database may be in test mode or rules may be blocking writes.'
            } else if (err.code === 'unavailable') {
                errorMessage = 'Firebase service is unavailable. Please check your internet connection.'
            } else if (err.message) {
                errorMessage = `Error: ${err.message}`
            }

            setError(errorMessage)
            alert(`Error: ${errorMessage}\n\nCheck the browser console (F12) for more details.`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 max-w-3xl">
                <div className="mb-6 sm:mb-8 md:mb-12 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-black bg-primary flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <Search className="h-8 w-8 sm:h-10 sm:w-10 text-black" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase mb-2 sm:mb-4">
                        <span className="text-black">REPORT</span>
                        <br />
                        <span className="text-primary">LOST ITEM</span>
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
                        Provide details about your lost item. Our AI will scan thousands of found items to find a match.
                    </p>
                </div>

                {/* QR Scanner Option */}
                <div className="mb-6 sm:mb-8 bg-white border-2 border-black p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                        <div className="flex-1">
                            <h3 className="text-base sm:text-lg md:text-xl font-black uppercase mb-1 sm:mb-2">SCAN FOUND ITEM QR CODE</h3>
                            <p className="text-gray-600 text-xs sm:text-sm">
                                Scan the QR code from the found person to confirm item receipt
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowScanner(!showScanner)}
                            className="bg-primary border-2 border-black px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wide text-black hover:bg-accent transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                            {showScanner ? 'CLOSE' : 'OPEN SCANNER'}
                        </button>
                    </div>
                    {showScanner && (
                        <div className="mt-3 sm:mt-4">
                            <div className="border-2 border-black p-2 sm:p-4 bg-black">
                                <div id="qr-reader-lost" ref={scannerRef} style={{ width: '100%', minHeight: '250px' }}></div>
                            </div>
                            {scannedData && (
                                <div className="mt-3 sm:mt-4 bg-primary border-2 border-black p-3 sm:p-4">
                                    <p className="text-xs sm:text-sm font-bold uppercase mb-2">SCANNED DATA</p>
                                    <p className="text-xs font-mono break-all">{JSON.stringify(scannedData, null, 2)}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="bg-white border-2 border-black p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                    <div>
                        <label className="block text-xs sm:text-sm font-black uppercase tracking-wide mb-1 sm:mb-2">
                            ITEM NAME / TYPE
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Blue Dell Laptop"
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-black bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-black uppercase tracking-wide mb-1 sm:mb-2">
                            CATEGORY
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-black bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="electronics">Electronics</option>
                            <option value="documents">Documents</option>
                            <option value="clothing">Clothing</option>
                            <option value="accessories">Accessories</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-black uppercase tracking-wide mb-1 sm:mb-2">
                            DESCRIPTION
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Provide details like color, scratches, unique identifiers, brand, model..."
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-black bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            required
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-black uppercase tracking-wide mb-1 sm:mb-2">
                                LOCATION LOST
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Central Library"
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-black bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-black uppercase tracking-wide mb-1 sm:mb-2">
                                DATE LOST
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-black bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-black uppercase tracking-wide mb-1 sm:mb-2">
                            UPLOAD IMAGE (OPTIONAL)
                        </label>
                        <div className="border-2 border-dashed border-black p-4 sm:p-6 md:p-8 text-center hover:bg-primary transition-colors">
                            <Upload className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-2 sm:mb-4 text-black" />
                            <p className="text-black text-sm sm:text-base font-medium mb-1 sm:mb-2">Click to upload or drag and drop</p>
                            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">PNG, JPG up to 5MB</p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="imageUpload"
                            />
                            <label
                                htmlFor="imageUpload"
                                className="inline-block bg-black text-white px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wide cursor-pointer hover:bg-primary hover:text-black transition-colors"
                            >
                                Choose File
                            </label>
                            {formData.image && (
                                <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-black font-medium break-words">
                                    Selected: {formData.image.name}
                                </p>
                            )}
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
                        className="w-full bg-primary border-2 border-black px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-sm sm:text-base font-black uppercase tracking-wide text-black hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'SUBMITTING...' : 'SUBMIT REPORT'}
                    </button>
                </form>

                {/* Matching Results Section */}
                {submitted && (
                    <div className="mt-12">
                        <div className="mb-8 text-center">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-4xl md:text-5xl font-black uppercase">
                                    <span className="text-black">MATCHING</span>
                                    <br />
                                    <span className="text-primary">RESULTS</span>
                                </h2>
                                <button
                                    onClick={() => {
                                        setSubmitted(false)
                                        setMatchingItems([])
                                        setFormData({
                                            title: '',
                                            description: '',
                                            category: 'electronics',
                                            location: '',
                                            date: '',
                                            image: null,
                                        })
                                        setScannedData(null)
                                    }}
                                    className="bg-primary border-2 border-black px-6 py-3 font-black uppercase tracking-wide text-black hover:bg-accent transition-all"
                                >
                                    REPORT ANOTHER ITEM
                                </button>
                            </div>
                            {searching && (
                                <p className="text-gray-600 font-bold uppercase animate-pulse">
                                    Searching database...
                                </p>
                            )}
                        </div>

                        {!searching && matchingItems.length === 0 && (
                            <div className="bg-white border-2 border-black p-6 sm:p-8 text-center">
                                <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-400" />
                                <p className="text-lg sm:text-xl font-black uppercase mb-2">NO MATCHES FOUND</p>
                                <p className="text-gray-600 text-sm sm:text-base px-2">
                                    We couldn't find any matching items in our database.
                                    We'll notify you if someone reports finding your item.
                                </p>
                            </div>
                        )}

                        {!searching && matchingItems.length > 0 && (
                            <div className="space-y-4 sm:space-y-6">
                                <div className="bg-primary border-2 border-black p-3 sm:p-4 text-center">
                                    <p className="text-lg sm:text-xl md:text-2xl font-black uppercase text-black">
                                        Found {matchingItems.length} Potential Match{matchingItems.length > 1 ? 'es' : ''}!
                                    </p>
                                </div>

                                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    {matchingItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="bg-white border-2 border-black p-4 sm:p-6 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
                                        >
                                            {/* Item Image */}
                                            {item.imageUrl && (
                                                <div className="mb-3 sm:mb-4 border-2 border-black">
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.title}
                                                        className="w-full h-40 sm:h-48 object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available'
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            {/* Item Details */}
                                            <div className="space-y-2 sm:space-y-3">
                                                <h3 className="text-lg sm:text-xl md:text-2xl font-black uppercase text-black border-b-2 border-black pb-1 sm:pb-2 break-words">
                                                    {item.title}
                                                </h3>

                                                {item.description && (
                                                    <p className="text-gray-700 text-sm sm:text-base break-words">
                                                        <span className="font-bold">Description:</span> {item.description}
                                                    </p>
                                                )}

                                                {item.location && (
                                                    <div className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                                                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <span className="font-bold">Found at:</span> {item.location}
                                                        </div>
                                                    </div>
                                                )}

                                                {item.category && (
                                                    <div className="flex items-center gap-2 text-sm sm:text-base">
                                                        <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 flex-shrink-0" />
                                                        <span className="text-gray-700">
                                                            <span className="font-bold">Category:</span> {item.category}
                                                        </span>
                                                    </div>
                                                )}

                                                {item.createdAt && (
                                                    <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
                                                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                                        <span>
                                                            Reported: {
                                                                item.createdAt?.toDate ?
                                                                    new Date(item.createdAt.toDate()).toLocaleDateString() :
                                                                    item.createdAt?.seconds ?
                                                                        new Date(item.createdAt.seconds * 1000).toLocaleDateString() :
                                                                        'Recently'
                                                            }
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Phone Number - Contact Information - Prominently Displayed */}
                                                {item.phoneNumber ? (
                                                    <div className="mt-3 sm:mt-4 bg-gradient-to-r from-blue-100 to-blue-50 border-2 border-blue-600 p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                                        <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                                                            <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-blue-700 flex-shrink-0" />
                                                            <p className="text-sm sm:text-base font-black uppercase text-blue-700">
                                                                📞 CONTACT THE FINDER
                                                            </p>
                                                        </div>
                                                        <a
                                                            href={`tel:${item.phoneNumber.replace(/\D/g, '')}`}
                                                            className="block bg-white border-2 border-blue-600 p-3 sm:p-4 text-center hover:bg-blue-50 transition-colors"
                                                        >
                                                            <p className="text-xl sm:text-2xl md:text-3xl font-black text-blue-700 hover:text-blue-900 break-all">
                                                                {item.phoneNumber}
                                                            </p>
                                                        </a>
                                                        <p className="text-xs sm:text-sm text-blue-600 mt-3 text-center font-bold">
                                                            👆 Tap to call the person who found this item
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="mt-3 sm:mt-4 bg-yellow-100 border-2 border-yellow-500 p-3 sm:p-4">
                                                        <p className="text-xs sm:text-sm text-yellow-700 text-center">
                                                            ⚠️ Contact information not available for this item
                                                        </p>
                                                    </div>
                                                )}

                                                {/* OTP and Item ID Section - Prominently Displayed */}
                                                {(item.otp || item.itemId) && (
                                                    <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                                                        <div className="bg-green-100 border-2 border-green-500 p-3 sm:p-4">
                                                            <p className="text-xs sm:text-sm font-black uppercase text-green-700 mb-2 sm:mb-3 text-center">
                                                                🔑 CLAIMING CREDENTIALS
                                                            </p>

                                                            {/* OTP Code */}
                                                            {item.otp && (
                                                                <div className="mb-3 sm:mb-4">
                                                                    <p className="text-xs font-bold uppercase text-gray-600 mb-1 sm:mb-2">OTP CODE</p>
                                                                    <div className="bg-white border-2 border-black p-3 sm:p-4 text-center">
                                                                        <p className="text-2xl sm:text-3xl md:text-4xl font-black text-black tracking-widest">
                                                                            {item.otp}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Item ID */}
                                                            {(item.itemId || item.id) && (
                                                                <div>
                                                                    <p className="text-xs font-bold uppercase text-gray-600 mb-1 sm:mb-2">ITEM ID</p>
                                                                    <div className="bg-white border-2 border-black p-2 sm:p-3 text-center">
                                                                        <p className="text-xs sm:text-sm font-mono text-black break-all">
                                                                            {item.itemId || item.id}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <p className="text-xs text-gray-600 mt-3 text-center">
                                                                Use these credentials in the "Claim Item" page to claim this item.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Button */}
                                                <button
                                                    onClick={() => {
                                                        // Navigate to Claim Item page with OTP and Item ID pre-filled
                                                        const otp = item.otp || ''
                                                        const itemId = item.itemId || item.id || ''
                                                        navigate(`/claim-item?otp=${otp}&itemId=${itemId}`, { replace: false })
                                                    }}
                                                    className="w-full bg-primary border-2 border-black px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-black uppercase tracking-wide text-black hover:bg-accent transition-all flex items-center justify-center gap-2 mt-3 sm:mt-4"
                                                >
                                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    CLAIM THIS ITEM
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ReportLost
