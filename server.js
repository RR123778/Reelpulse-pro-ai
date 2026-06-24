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

    const postData = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
    });

    // Hum direct 'gemini-2.5-flash' target kar rahe hain jo bilkul naya hai aur ispe load restriction nahi hai
    const options = {
        hostname: 'generativelanguage.googleapis.com',
        port: 443,
        path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
                    console.error("Primary Model Error:", data.error.message);
                    
                    // SMART BACKUP: Agar high demand ya koi error aaye, toh turant backup model par bhej do
                    return tryBackupModel(prompt, res, GEMINI_API_KEY);
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

// Backup function jo automatic load shift karegi
function tryBackupModel(prompt, res, apiKey) {
    const postData = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
    });

    const options = {
        hostname: 'generativelanguage.googleapis.com',
        port: 443,
        path: `/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const backupReq = https.request(options, (backupRes) => {
        let body = '';
        backupRes.on('data', (chunk) => body += chunk);
        backupRes.on('end', () => {
            try {
                const data = JSON.parse(body);
                if (data.error) {
                    return res.status(400).json({ error: "Google standard servers are busy. Please try after 1 minute." });
                }
                res.json(data);
            } catch (e) {
                res.status(500).json({ error: "Backup parsing error" });
            }
        });
    });

    backupReq.write(postData);
    backupReq.end();
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});