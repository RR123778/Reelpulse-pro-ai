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

    // Gemini API ka proper payload structure
    const postData = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
    });

    // FIXED: Google ke standard /v1/ models path ko exact model mapping ke sath use kar rahe hain
    const options = {
        hostname: 'generativelanguage.googleapis.com',
        port: 443,
        path: `/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
                
                // Agar stable v1 mana kare, toh automatic backup trigger hoga
                if (data.error) {
                    console.error("Google API Error on v1, trying backup...");
                    return fallbackToBeta(prompt, res, GEMINI_API_KEY);
                }
                res.json(data);
            } catch (e) {
                res.status(500).json({ error: "Response parse error" });
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

// Fallback Function jo safe side ke liye v1beta bhi try karegi agar zaroorat padi toh
function fallbackToBeta(prompt, res, apiKey) {
    const postData = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
    });

    const options = {
        hostname: 'generativelanguage.googleapis.com',
        port: 443,
        path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const fallbackReq = https.request(options, (fallbackRes) => {
        let body = '';
        fallbackRes.on('data', (chunk) => body += chunk);
        fallbackRes.on('end', () => {
            try {
                const data = JSON.parse(body);
                if (data.error) {
                    return res.status(400).json({ error: data.error.message });
                }
                res.json(data);
            } catch (e) {
                res.status(500).json({ error: "Fallback parse error" });
            }
        });
    });

    fallbackReq.write(postData);
    fallbackReq.end();
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});