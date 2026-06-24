const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Base Route
app.get('/', (req, res) => {
    res.send("ReelPulse Pro Backend Server is Running Securely!");
});

// Main generate endpoint
app.post('/generate', async (req, res) => {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const { prompt } = req.body;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: "Backend config error: GEMINI_API_KEY is missing on Render settings." });
    }

    // DIRECT STEP: Pehle hi v1beta try karte hain jo test-proven hai aur kabhi fail nahi hota
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("Google API Error:", data.error);
            // Sahi string formate me error bhejenge taaki frontend 'object' na dikhaye
            return res.status(400).json({ error: data.error.message || "Google API returned an error" });
        }

        return res.json(data);
        
    } catch (error) {
        console.error("Catch Error:", error.message);
        return res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});