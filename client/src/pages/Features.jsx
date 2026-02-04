import React, { useEffect, useState } from 'react'
import { Brain, Bell, Shield, Zap, Users, Globe } from 'lucide-react'
import { db } from '../firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'

const Features = () => {
    const [features, setFeatures] = useState([])
    const [loading, setLoading] = useState(true)

    // Map strings from database to Lucide components
    const iconMap = {
        Brain: Brain,
        Bell: Bell,
        Shield: Shield,
        Zap: Zap,
        Users: Users,
        Globe: Globe
    }

    useEffect(() => {
        // Reference to your 'features' collection
        const q = query(collection(db, "features"), orderBy("order", "asc"));

        // Real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedFeatures = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setFeatures(fetchedFeatures)
            setLoading(false)
        }, (error) => {
            console.error("Error fetching features:", error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl font-black uppercase animate-pulse">Loading Features...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
                <div className="mb-6 sm:mb-8 md:mb-12 text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black uppercase mb-2 sm:mb-4">
                        <span className="text-black">POWERFUL</span>
                        <br />
                        <span className="text-red-600">FEATURES</span>
                    </h1>
                </div>

                {/* Features Grid */}
                <div className="border-2 border-black">
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => {
                            const Icon = iconMap[feature.iconName] || Zap
                            const isEvenRow = Math.floor(index / 3) % 2 === 1

                            return (
                                <div
                                    key={feature.id}
                                    className={`p-4 sm:p-6 md:p-8 border-2 border-black transition-colors hover:bg-gray-50 ${isEvenRow ? 'bg-gray-100' : 'bg-white'
                                        }`}
                                >
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-2 border-black flex items-center justify-center mb-4 sm:mb-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-black" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-black uppercase mb-2 sm:mb-4">{feature.title}</h3>
                                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{feature.description}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Features