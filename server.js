const express = require('express');
const cors = require('cors');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("ReelPulse Pro Backend Server is Running Securely!");
});

app.post('/generate', (req, res) => {
    // BACKUP METHOD: Agar Render me key missing ho toh direct yahan se uthayega
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "  ";
    const { prompt } = req.body;

    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("PASTE_YOUR")) {
        return res.status(500).json({ error: "Backend config error: API Key lagana chhut gaya hai code me." });
    }

    const postData = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
    });

    // Pure dynamic endpoint jise Google busy nahi bol sakta
    const options = {
        hostname: 'generativelanguage.googleapis.com',
        port: 443,
        path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
                if (data.error) {
                    console.error("Google API Error:", data.error.message);
                    return res.status(400).json({ error: data.error.message });
                }
                res.json(data);
            } catch (e) {
                res.status(500).json({ error: "Response parsing problem." });
            }
        });
    });

    googleReq.on('error', (error) => {
        res.status(500).json({ error: error.message });
    });

    googleReq.write(postData);
    googleReq.end();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});