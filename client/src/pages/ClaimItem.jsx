import React, { useState, useEffect } from 'react'
import { Key, Package, CheckCircle, Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { db } from '../firebase'
import { collection, query, where, getDocs, doc, deleteDoc, onSnapshot, getDoc } from 'firebase/firestore'

const ClaimItem = () => {
    const [searchParams] = useSearchParams()
    const [foundItems, setFoundItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)
    const [otpInput, setOtpInput] = useState('')
    const [itemIdInput, setItemIdInput] = useState('')
    const [searching, setSearching] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)

    // Initialize component and pre-fill OTP/Item ID from URL params
    useEffect(() => {
        setIsInitialized(true)
        
        // Pre-fill OTP and Item ID from URL parameters (when coming from ReportLost page)
        const otpParam = searchParams.get('otp')
        const itemIdParam = searchParams.get('itemId')
        
        if (otpParam) {
            setOtpInput(otpParam)
        }
        if (itemIdParam) {
            setItemIdInput(itemIdParam)
        }
    }, [searchParams])

    // Fetch only found items uploaded by the current user
    useEffect(() => {
        const fetchFoundItems = async () => {
            try {
                // Get current user ID from localStorage
                const userId = localStorage.getItem('userId')
                
                if (!userId) {
                    // No user ID means no items uploaded yet
                    setFoundItems([])
                    return
                }

                const foundItemsQuery = query(
                    collection(db, 'items'),
                    where('type', '==', 'found'),
                    where('userId', '==', userId)
                )
                
                const unsubscribe = onSnapshot(foundItemsQuery, (snapshot) => {
                    const items = []
                    snapshot.forEach((doc) => {
                        const data = doc.data()
                        items.push({
                            id: doc.id,
                            ...data
                        })
                    })
                    setFoundItems(items)
                })

                return () => unsubscribe()
            } catch (err) {
                console.error('Error fetching found items:', err)
                setError('Failed to load found items')
            }
        }

        fetchFoundItems()
    }, [])

    const handleClaimItem = React.useCallback(async (itemId, itemName) => {
        setLoading(true)
        setError(null)
        setSuccessMessage(null)

        try {
            // Delete the item from database
            const itemRef = doc(db, 'items', itemId)
            await deleteDoc(itemRef)

            setSuccessMessage(`✅ Item "${itemName}" has been successfully claimed and removed from the database!`)
            
            // Clear inputs
            setOtpInput('')
            setItemIdInput('')
            
            // Clear success message after 5 seconds
            setTimeout(() => {
                setSuccessMessage(null)
            }, 5000)
        } catch (err) {
            console.error('Error claiming item:', err)
            setError('Failed to claim item. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [])

    const handleSearchByOtp = async () => {
        if (!otpInput || otpInput.trim() === '') {
            setError('Please enter an OTP')
            return
        }

        if (!itemIdInput || itemIdInput.trim() === '') {
            setError('Please enter both OTP and Item ID to claim the item')
            return
        }

        setSearching(true)
        setError(null)
        setSuccessMessage(null)

        try {
            const otp = otpInput.trim()
            const itemId = itemIdInput.trim()
            
            // Search for item by both OTP and Item ID for security
            const itemsQuery = query(
                collection(db, 'items'),
                where('type', '==', 'found'),
                where('otp', '==', otp),
                where('itemId', '==', itemId)
            )

            const querySnapshot = await getDocs(itemsQuery)
            
            if (querySnapshot.empty) {
                // Also try by document ID if itemId field doesn't match
                try {
                    const itemRef = doc(db, 'items', itemId)
                    const itemSnap = await getDoc(itemRef)
                    
                    if (itemSnap.exists()) {
                        const itemData = itemSnap.data()
                        if (itemData.otp === otp && itemData.type === 'found') {
                            await handleClaimItem(itemSnap.id, itemData.title || 'Item')
                            return
                        }
                    }
                } catch (e) {
                    // Continue to error message
                }
                
                setError('No item found with this OTP and Item ID combination. Please verify both codes and try again.')
            } else {
                const itemDoc = querySnapshot.docs[0]
                const itemData = itemDoc.data()
                
                // Claim the item
                await handleClaimItem(itemDoc.id, itemData.title || 'Item')
            }
        } catch (err) {
            console.error('Error searching by OTP:', err)
            setError('Failed to search item. Please try again.')
        } finally {
            setSearching(false)
        }
    }


    // Prevent blank screen - ensure component always renders
    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-bold">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 max-w-6xl">
                <div className="mb-6 sm:mb-8 md:mb-12 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-black bg-primary flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <Key className="h-8 w-8 sm:h-10 sm:w-10 text-black" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase mb-2 sm:mb-4">
                        <span className="text-black">CLAIM</span>
                        <br />
                        <span className="text-primary">YOUR ITEM</span>
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
                        Search for items by OTP or Item ID to claim them.
                    </p>
                </div>

                {/* Success/Error Messages */}
                {successMessage && (
                    <div className="mb-6 bg-green-100 border-2 border-green-500 p-4 text-green-700 font-bold uppercase text-sm sm:text-base text-center">
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="mb-6 bg-red-100 border-2 border-red-500 p-4 text-red-700 font-bold uppercase text-sm sm:text-base text-center">
                        {error}
                    </div>
                )}

                {/* Search by OTP and Item ID */}
                <div className="mb-6 sm:mb-8 bg-white border-2 border-black p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-black uppercase mb-4 sm:mb-6 flex items-center gap-2">
                        <Key className="h-5 w-5 sm:h-6 sm:w-6" />
                        CLAIM ITEM BY OTP & ITEM ID
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-black uppercase text-black mb-2">
                                OTP CODE (6-DIGIT)
                            </label>
                            <input
                                type="text"
                                value={otpInput}
                                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Enter 6-digit OTP"
                                maxLength="6"
                                className="w-full border-2 border-black p-3 sm:p-4 text-sm sm:text-base font-bold text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-black uppercase text-black mb-2">
                                ITEM ID
                            </label>
                            <input
                                type="text"
                                value={itemIdInput}
                                onChange={(e) => setItemIdInput(e.target.value)}
                                placeholder="Enter Item ID"
                                className="w-full border-2 border-black p-3 sm:p-4 text-sm sm:text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <button
                            onClick={handleSearchByOtp}
                            disabled={searching || loading || !otpInput || !itemIdInput}
                            className="w-full bg-primary border-2 border-black px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-black uppercase tracking-wide text-black hover:bg-accent transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                            {searching ? 'SEARCHING...' : 'CLAIM ITEM'}
                        </button>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-3">
                        Enter both the 6-digit OTP code and Item ID to securely claim the item. Both are required for verification.
                    </p>
                </div>

                {/* Display OTPs for Found Items Uploaded by User */}
                <div className="bg-white border-2 border-black p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-black uppercase mb-4 sm:mb-6 flex items-center gap-2">
                        <Package className="h-5 w-5 sm:h-6 sm:w-6" />
                        YOUR UPLOADED ITEMS (OTP CODES)
                    </h3>
                    
                    {foundItems.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                            <p className="text-xl font-black uppercase mb-2">NO ITEMS UPLOADED</p>
                            <p className="text-gray-600 text-sm sm:text-base">
                                You haven't uploaded any items yet. Upload items in the "Report Found" section to generate OTP codes.
                            </p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                            {foundItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white border-2 border-black p-4 sm:p-6 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
                                >
                                    {/* Item Name */}
                                    <h4 className="text-sm sm:text-base font-black uppercase mb-3 sm:mb-4 text-center break-words">
                                        {item.title}
                                    </h4>

                                    {/* OTP Display */}
                                    <div className="bg-primary border-2 border-black p-4 sm:p-5 mb-3 sm:mb-4 text-center">
                                        <p className="text-xs sm:text-sm font-bold uppercase text-black mb-1 sm:mb-2">OTP CODE</p>
                                        <p className="text-2xl sm:text-3xl md:text-4xl font-black text-black tracking-widest">
                                            {item.otp || 'N/A'}
                                        </p>
                                    </div>

                                    {/* Item ID */}
                                    <div className="bg-gray-100 border-2 border-black p-2 sm:p-3 mb-3 sm:mb-4 text-center">
                                        <p className="text-xs font-bold uppercase text-gray-600 mb-1">ITEM ID</p>
                                        <p className="text-xs sm:text-sm font-mono text-black break-all">
                                            {item.itemId || item.id}
                                        </p>
                                    </div>

                                    {/* Item Details */}
                                    {item.location && (
                                        <p className="text-xs sm:text-sm text-gray-600 text-center mb-2">
                                            📍 {item.location}
                                        </p>
                                    )}

                                    {/* Status Badge */}
                                    <div className="mt-3 sm:mt-4 bg-green-500 border-2 border-black p-2 text-center">
                                        <p className="text-xs font-black uppercase text-black">
                                            FOUND ITEM
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ClaimItem
