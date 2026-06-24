
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

    try {
        // FIXED: URL me humne stable 'v1' ke sath 'gemini-1.5-flash' ka explicit endpoint use kiya hai
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
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
        
        // Agar Google abhi bhi model error de, toh backup ke liye 'v1beta' par automatic switch karein
        if (data.error && data.error.message.includes("not found")) {
            console.log("Retrying with v1beta endpoint...");
            const backupUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
            const backupResponse = await fetch(backupUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const backupData = await backupResponse.json();
            return res.json(backupData);
        }
        
        if (data.error) {
            console.error("Google API Error:", data.error);
            return res.status(400).json({ error: data.error.message });
        }

        res.json(data);
        
    } catch (error) {
        console.error("Catch Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});