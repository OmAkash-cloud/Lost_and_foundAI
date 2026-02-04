import React, { useState } from 'react';
import { db } from '../firebase'; // Ensure this path correctly points to your firebase.js
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function ReportLost() {
    const [formData, setFormData] = useState({
        itemName: '',
        location: '',
        description: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // This saves the data to the "items" collection in Firestore
            await addDoc(collection(db, "items"), {
                ...formData,
                status: "lost",
                createdAt: serverTimestamp()
            });
            alert("Lost item reported successfully!");
            setFormData({ itemName: '', location: '', description: '' });
        } catch (error) {
            console.error("Error reporting item: ", error);
            alert("Failed to report item. Check console for details.");
        }
    };

    return (
        <div className="p-8 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-6">Report a Lost Item</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Item Name (e.g., Blue Wallet)"
                    className="w-full p-2 border rounded"
                    value={formData.itemName}
                    onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                    required
                />
                <input
                    type="text"
                    placeholder="Location Lost (e.g., Library Second Floor)"
                    className="w-full p-2 border rounded"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                />
                <textarea
                    placeholder="Brief Description"
                    className="w-full p-2 border rounded"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                <button type="submit" className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700">
                    Submit Report
                </button>
            </form>
        </div>
    );
}

export default ReportLost;