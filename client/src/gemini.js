/**
 * Gemini AI Integration - ML Feature Extraction
 * Matches Google Colab implementation
 */

// API Key (same as Colab)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyCPE45PAY1H6_kdlWErmh73PO4WtKDqNBo";

/**
 * Analyze product image using Gemini AI (same as Colab)
 * @param {File} imageFile - The image file to analyze
 * @returns {Promise<string>} - The extracted product description
 */
export const analyzeProductImage = async (imageFile) => {
    try {
        console.log("📌 Analyzing image with Gemini AI...");
        console.log(`🔍 Analyzing ${imageFile.name}...`);

        // Convert image to base64 (same format as Colab)
        const imageBase64 = await fileToBase64(imageFile);

        // Same prompt as Colab
        const prompt = `
    Analyze this product image and provide:
    - Product Name and Category
    - Brand (if visible)
    - 3 Key Features (materials, tech, or design)
    - A short marketing description (2 sentences)
    `;

        // Use REST API with gemini-2.5-flash (same model as Colab)
        const requestBody = {
            contents: [{
                parts: [
                    { text: prompt },
                    {
                        inline_data: {
                            mime_type: imageFile.type || 'image/jpeg',
                            data: imageBase64
                        }
                    }
                ]
            }]
        };

        // Try gemini-2.5-flash first (same as Colab)
        let modelName = "gemini-2.5-flash";
        let response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            }
        );

        // Fallback to gemini-1.5-flash if 2.5-flash not available
        if (response.status === 404) {
            console.log(`Model ${modelName} not found, trying gemini-1.5-flash...`);
            modelName = "gemini-1.5-flash";
            response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                }
            );
        }

        // Fallback to gemini-1.5-pro if still not available
        if (response.status === 404) {
            console.log(`Model ${modelName} not found, trying gemini-1.5-pro...`);
            modelName = "gemini-1.5-pro";
            response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                }
            );
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error ${response.status}:`, errorText);
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid API response format');
        }

        const text = data.candidates[0].content.parts[0].text;
        
        console.log("=".repeat(35));
        console.log("✅ GEMINI PRODUCT DESCRIPTION");
        console.log("=".repeat(35));
        console.log(text);

        return text;

    } catch (error) {
        console.error("❌ Gemini AI error:", error);
        throw new Error(`AI analysis failed: ${error.message}`);
    }
};

/**
 * Convert File to Base64 string (same as Colab's image handling)
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 encoded string
 */
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove data:image/jpeg;base64, prefix (same as Colab)
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
};
