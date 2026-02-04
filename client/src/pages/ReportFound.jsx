import React, { useState } from 'react';
import { db } from '../firebase';
import { uploadImageToCloudinary } from '../utills/cloudinary';
import { collection, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { analyzeProductImage } from '../gemini';
import { Package, Upload, Sparkles } from 'lucide-react';

const ReportFound = () => {
    const [item, setItem] = useState({ title: '', location: '', description: '', category: 'electronics' });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const [aiDescription, setAiDescription] = useState(null);

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedImage = e.target.files[0];
            setImage(selectedImage);
            setAiDescription(null);

            // Automatically analyze image when selected
            setAnalyzing(true);
            try {
                console.log('📌 Analyzing image with Gemini AI...');
                const description = await analyzeProductImage(selectedImage);
                setAiDescription(description);
                console.log('✅ AI Description extracted:', description);

                // Auto-fill description field with AI analysis
                setItem(prev => ({ ...prev, description: description }));
            } catch (err) {
                console.error('AI analysis error:', err);
                // Don't show error to user, just log it - they can still proceed
            } finally {
                setAnalyzing(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Check if user is logged in (has phone number)
            const userPhone = localStorage.getItem('userPhone')
            if (!userPhone) {
                const shouldLogin = window.confirm('Please login with your phone number first to report a found item. This allows people who lost the item to contact you.\n\nWould you like to go to the login page?')
                if (shouldLogin) {
                    window.location.href = '/login'
                    return
                } else {
                    setLoading(false)
                    return
                }
            }

            if (!image) {
                throw new Error('Please upload an image of the found item.');
            }

            console.log('Uploading image to Cloudinary...');
            const imageUrl = await uploadImageToCloudinary(image);

            // Get or create user ID from localStorage
            let userId = localStorage.getItem('userId')
            if (!userId) {
                userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                localStorage.setItem('userId', userId)
            }

            // Generate OTP (6-digit code)
            const otp = Math.floor(100000 + Math.random() * 900000).toString()

            console.log('Saving item to Firestore...');
            const docRef = await addDoc(collection(db, "items"), {
                ...item,
                type: 'found',
                imageUrl,
                aiDescription: aiDescription || null,
                userId: userId, // Track which user uploaded this item
                phoneNumber: userPhone, // Store phone number for contact
                otp: otp, // Store OTP with the item
                createdAt: serverTimestamp(),
            });

            // Update the document with the item ID (after docRef is created)
            await updateDoc(docRef, {
                itemId: docRef.id,
            });

            console.log('Document written with ID:', docRef.id);

            alert(`✅ Found item logged successfully!\n\nOTP Code: ${otp}\nItem ID: ${docRef.id}\n\nSave these details to claim the item later.`);

            // Reset form
            setItem({ title: '', location: '', description: '', category: 'electronics' });
            setImage(null);
            setAiDescription(null);

            const fileInput = document.getElementById('foundItemImage');
            if (fileInput) fileInput.value = '';

        } catch (err) {
            console.error("Upload error:", err);
            setError(err.message || 'Failed to save found item.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-white p-4 sm:p-6 md:p-10">
            <div className="max-w-2xl mx-auto border-2 sm:border-4 border-black p-4 sm:p-6 md:p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
                    <Package className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 flex-shrink-0" />
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase">Report Found Item</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <input
                        className="w-full border-2 border-black p-2.5 sm:p-3 text-sm sm:text-base font-bold focus:bg-green-50"
                        placeholder="What did you find?"
                        value={item.title}
                        onChange={(e) => setItem({ ...item, title: e.target.value })}
                        required
                    />
                    <input
                        className="w-full border-2 border-black p-2.5 sm:p-3 text-sm sm:text-base font-bold"
                        placeholder="Where did you find it?"
                        value={item.location}
                        onChange={(e) => setItem({ ...item, location: e.target.value })}
                        required
                    />
                    <textarea
                        className="w-full border-2 border-black p-2.5 sm:p-3 text-sm sm:text-base h-24 sm:h-32 resize-none"
                        placeholder="Describe the item (color, brand, unique marks)..."
                        value={item.description}
                        onChange={(e) => setItem({ ...item, description: e.target.value })}
                    />

                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-xs sm:text-sm font-black uppercase tracking-wide mb-2">
                            UPLOAD IMAGE <span className="text-red-600">*</span>
                        </label>
                        <div className="border-2 border-dashed border-black p-4 sm:p-6 text-center hover:bg-green-50 transition-colors">
                            <Upload className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 sm:mb-3 text-black" />
                            <p className="text-black text-sm sm:text-base font-medium mb-1 sm:mb-2">Click to upload or drag and drop</p>
                            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">PNG, JPG up to 5MB</p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="foundItemImage"
                                required
                            />
                            <label
                                htmlFor="foundItemImage"
                                className="inline-block bg-black text-white px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wide cursor-pointer hover:bg-green-500 hover:text-black transition-colors"
                            >
                                Choose File
                            </label>
                            {image && (
                                <div className="mt-3 sm:mt-4">
                                    <p className="text-xs sm:text-sm text-black font-medium mb-2 break-words">
                                        Selected: {image.name}
                                    </p>
                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt="Preview"
                                        className="w-full max-w-xs mx-auto border-2 border-black rounded"
                                    />
                                    {analyzing && (
                                        <div className="mt-3 bg-primary border-2 border-black p-2 sm:p-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse text-black" />
                                                <span className="text-black font-bold uppercase text-xs sm:text-sm">
                                                    AI Analyzing Image...
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {aiDescription && !analyzing && (
                                        <div className="mt-3 bg-green-50 border-2 border-green-500 p-2 sm:p-3">
                                            <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                                                <span className="text-xs font-black uppercase text-green-700">
                                                    AI Description Extracted
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                                                {aiDescription.substring(0, 100)}...
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-100 border-2 border-red-500 p-3 sm:p-4 text-red-700 font-bold uppercase text-xs sm:text-sm break-words">
                            {error}
                        </div>
                    )}

                    <button
                        disabled={loading || !image}
                        className="w-full bg-green-500 text-black border-2 border-black py-3 sm:py-4 text-sm sm:text-base font-black uppercase hover:bg-green-400 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'POSTING...' : 'POST FOUND ITEM'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReportFound;