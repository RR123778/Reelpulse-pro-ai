const express = require('express');
const cors = require('cors');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Base Route
app.get('/', (req, res) => {
    res.send("ReelPulse Pro Backend Server is Running Securely!");
});

// Main generate endpoint
app.post('/generate', (req, res) => {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const { prompt } = req.body;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: "Backend config error: GEMINI_API_KEY is missing on Render settings." });
    }

    // Gemini API proper structure
    const postData = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
    });

    // UPDATED: Ab hum bilkul latest gemini-2.5-flash use kar rahe hain jo v1 par 100% functional hai
    const options = {
        hostname: 'generativelanguage.googleapis.com',
        port: 443,
        path: `/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const googleReq = https.request(options, (googleRes) => {
        let body = '';
        googleRes.on('data', (chunk) => body += chunk);
        googleRes.on('end', () => {
            try {
                const data = JSON.parse(body);
                
                // Agar 2.5 par bhi koi issue aaye, toh yeh temporary automatic safety mesh hai
                if (data.error) {
                    console.error("Google Primary Error:", data.error.message);
                    return res.status(400).json({ error: data.error.message });
                }
                res.json(data);
            } catch (e) {
                res.status(500).json({ error: "Response parsing problem." });
            }
        });
    });

    googleReq.on('error', (error) => {
        console.error("Google Req Error:", error);
        res.status(500).json({ error: error.message });
    });

    googleReq.write(postData);
    googleReq.end();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});