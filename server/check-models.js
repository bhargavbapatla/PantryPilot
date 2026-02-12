import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ No API Key found in .env");
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("🔍 Checking available models...");

fetch(url)
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      console.error("❌ API Error:", data.error.message);
    } else {
      console.log("✅ AVAILABLE MODELS:");
      const models = data.models || [];
      // Filter for 'generateContent' models only
      const chatModels = models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
      
      chatModels.forEach(m => {
        console.log(`   - ${m.name.replace('models/', '')}`);
      });
      
      if (chatModels.length === 0) {
        console.log("⚠️ No chat models found. Your key might be restricted.");
      }
    }
  })
  .catch(err => console.error("❌ Network Error:", err));