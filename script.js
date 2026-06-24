// TODO: Render deploy hone ke baad apna naya URL yahan paste karein
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

    // UI Loading state
    outputBox.style.display = "block";
    resultContent.innerHTML = "⏳ <strong>ReelPulse AI</strong> is thinking & creating a viral plan... Please wait!";
    generateBtn.disabled = true;
    generateBtn.innerHTML = "Generating Script...";
    generateBtn.style.opacity = "0.7";

    // High engagement prompt structure
    const promptText = `You are a world-class social media viral strategist. Create a complete high-engagement video plan.
    Platform: ${platform}
    Topic: ${topic}
    Tone: ${tone}
    Language: Pure Hinglish (Natural Hindi + English mix, conversational style).

    Format the output strictly like this with icons:
    🔥 **VIRAL HOOK (First 3 Seconds):** [Hook]
    
    📝 **VIDEO SCRIPT (Step-by-Step):** [Provide 3 highly engaging steps/points]
    
    🎯 **CALL TO ACTION (CTA):** [High converting CTA]
    
    ✍️ **ATTRACTIVE CAPTION:** [Ready-to-use aesthetic caption]
    
    #️⃣ **VIRAL HASHTAGS:** [Trending hashtags separated by spaces]`;

    try {
        const response = await fetch(`${RENDER_BACKEND_URL}/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt: promptText })
        });

        const data = await response.json();

        // Safe check for Gemini structural output
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
            let aiText = data.candidates[0].content.parts[0].text;
            
            // Format Markdown bold to HTML bold and newlines to linebreaks
            aiText = aiText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            aiText = aiText.replace(/\n/g, '<br>');
            
            resultContent.innerHTML = aiText;
        } else if (data.error) {
            resultContent.innerHTML = `❌ Error: ${data.error}`;
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

// Global Copy function
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
