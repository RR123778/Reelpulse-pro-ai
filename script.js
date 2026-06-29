// ✅ Clean backend URL
const RENDER_BACKEND_URL = "https://reelpulse-pro-ai.onrender.com";

async function generateContent() {
    const topic = document.getElementById('topic').value.trim();
    const platform = document.getElementById('platform').value;
    const tone = document.getElementById('tone').value;
    const outputBox = document.getElementById('output');
    const resultContent = document.getElementById('result-content');
    const generateBtn = document.getElementById('generateBtn');

    if (!topic) {
        alert("Please ek pyara sa topic enter kijiye!");
        return;
    }

    // 🎲 Random Hook Style Generator
    const hookStyles = [
        "Question",
        "Shock",
        "Bold claim",
        "Story",
        "Controversy",
        "Curiosity"
    ];
    const randomStyle = hookStyles[Math.floor(Math.random() * hookStyles.length)];

    // UI Loading
    outputBox.style.display = "block";
    resultContent.innerHTML = "⏳ <strong>ReelPulse AI</strong> viral content bana raha hai... Please wait!";
    generateBtn.disabled = true;
    generateBtn.innerHTML = "Generating Script...";
    generateBtn.style.opacity = "0.7";

    // 🔥 SUPER PROMPT (Unique Hook Fix)
    const promptText = `You are a world-class social media viral strategist.

IMPORTANT RULES:
- Generate a COMPLETELY UNIQUE hook every time.
- NEVER repeat hooks like "Did you know..."
- Hook must be highly engaging and scroll-stopping.
- Use this Hook Style: ${randomStyle}
- Use curiosity, emotion, or shock.

Platform: ${platform}
Topic: ${topic}
Tone: ${tone}
Language: Pure Hinglish (Natural Hindi + English mix).

Also generate 3 hook options internally and pick the BEST one.

Format strictly:

🔥 **VIRAL HOOK (First 3 Seconds):** [Hook]

📝 **VIDEO SCRIPT (Step-by-Step):**
1. [Point]
2. [Point]
3. [Point]

🎯 **CALL TO ACTION (CTA):** [CTA]

✍️ **ATTRACTIVE CAPTION:** [Caption]

#️⃣ **VIRAL HASHTAGS:** [Hashtags separated by spaces]`;

    try {
        const response = await fetch(`${RENDER_BACKEND_URL}/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt: promptText })
        });

        const data = await response.json();

        if (
            data.candidates &&
            data.candidates[0].content &&
            data.candidates[0].content.parts &&
            data.candidates[0].content.parts[0].text
        ) {
            let aiText = data.candidates[0].content.parts[0].text;

            // ✅ FIXED Bold Regex
            aiText = aiText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            // Line break formatting
            aiText = aiText.replace(/\n/g, '<br>');

            resultContent.innerHTML = aiText;
        } else if (data.error) {
            console.error("API Error Details:", data.error);
            let errorMsg = typeof data.error === 'object'
                ? JSON.stringify(data.error)
                : data.error;

            resultContent.innerHTML = `❌ Error: ${errorMsg}`;
        } else {
            resultContent.innerHTML = "❌ Error: Content generate nahi ho paya. Please try again.";
        }

    } catch (error) {
        console.error("Fetch Error:", error);
        resultContent.innerHTML = "❌ Server connect nahi ho pa raha hai. Please check configuration.";
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = "🚀 Generate Content";
        generateBtn.style.opacity = "1";
    }
}

// 📋 Copy Function
function copyToClipboard() {
    const textToCopy = document.getElementById('result-content').innerText;
    const tempTextArea = document.createElement("textarea");

    tempTextArea.value = textToCopy;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();

    try {
        document.execCommand('copy');

        const copyBtn = document.querySelector('.copy-btn');
        copyBtn.innerText = "✅ Copied!";

        setTimeout(() => {
            copyBtn.innerText = "📋 Copy All";
        }, 2000);

    } catch (err) {
        alert("Copy nahi ho paya!");
    }

    document.body.removeChild(tempTextArea);
}