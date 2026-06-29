// ReelPulse Pro - Frontend Logic
const BACKEND_URL = "https://reelpulse-pro-ai.onrender.com"; 

async function generateContent() {
    const topic = document.getElementById('topic').value.trim();
    const platform = document.getElementById('platform').value;
    const tone = document.getElementById('tone').value;
    const lang = document.getElementById('language').value;
    const btn = document.getElementById('generateBtn');
    const outputBox = document.getElementById('output');
    const resultContent = document.getElementById('result-content');

    // Validation: Agar topic khali hai
    if (!topic) {
        alert('Please enter a topic first!');
        return;
    }

    // UI Loading State
    btn.innerText = "⏳ AI is thinking & writing...";
    btn.disabled = true;
    outputBox.style.display = "none";

    // AI ke liye dynamic prompt ready karna
    const aiPrompt = `Act as an expert scriptwriter. Create a highly engaging viral short-form video script for ${platform}. 
Topic: "${topic}"
Tone: ${tone}
Language: Strictly write the complete script and response text in ${lang}.

Format the output exactly like this with clear emojis:
🔥 [VIRAL SCRIPT FOR ${platform.toUpperCase()}]
📌 Topic: ${topic}
🎭 Vibe: ${tone}

⏳ 0:00 - 0:03 (HOOK):
[Give an insanely catchy hook sentence here]

💡 0:03 - 0:12 (BODY):
[Give 2-3 powerful, fast-paced bullet points explaining the topic clearly]

🚀 0:12 - 0:15 (CTA):
[Give a creative call to action to save and follow]

📝 BEST CAPTION:
[Write a short viral caption here]

🏷️ VIRAL HASHTAGS:
[Provide 5-6 highly relevant trending hashtags]`;

    try {
        // Live Render Backend par request bhejna
        const response = await fetch(`${BACKEND_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: aiPrompt })
        });

        const data = await response.json();

        // Error check karna
        if (data.error) {
            alert(`API Error: ${data.error}`);
            resetButton();
            return;
        }

        // Gemini AI ke response ko safe tarike se screen par dikhana
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            resultContent.innerText = data.candidates[0].content.parts[0].text;
            outputBox.style.display = "block";
            outputBox.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert("Could not read AI response format. Try again.");
        }

    } catch (error) {
        console.error(error);
        alert("Failed to connect to backend server. Make sure your Render server is active!");
    } finally {
        resetButton();
    }

    function resetButton() {
        btn.innerText = "🚀 Generate AI Script";
        btn.disabled = false;
    }
}

// Copy to Clipboard Function
function copyToClipboard() {
    const text = document.getElementById('result-content').innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert('📋 Script successfully copied to clipboard!');
    }).catch(err => {
        alert('Oops, copy failed!');
    });
}