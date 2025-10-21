// src/utils/aiModels.js

const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// ✅ Free Models List from OpenRouter (Updated)
// Replace in your MODELS map:
const MODELS = {
    openai: "openai/gpt-oss-20b",
    nemotron: "nvidia/nemotron-nano-9b-v2",     // ← new model
    llama: "meta-llama/llama-3.3-70b-instruct",
    deepseek: "deepseek/deepseek-r1-0528",
  };

/**
 * 🌍 Unified AI Response Function — using OpenRouter (1 key for all)
 */
export async function getAIResponse(model, prompt, history = []) {
  try {
    // ✅ Validate API key
    if (!OPENROUTER_KEY) {
      console.error("❌ Missing OpenRouter API Key");
      return "⚠️ Missing API key. Please check your .env file.";
    }

    // ✅ Choose model or default to Agentica
    const selectedModel = MODELS[model] || MODELS.nemotron;

    // ✅ Create messages payload
    const messages = [
      ...history.map((m) => ({
        role: m.isUser ? "user" : "assistant",
        content: m.text,
      })),
      { role: "user", content: prompt },
    ];

    // ✅ Send request to OpenRouter
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_KEY}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ OpenRouter Error:", data);
      return `⚠️ ${data.error?.message || "Something went wrong."}`;
    }

    return data.choices?.[0]?.message?.content?.trim() || "⚠️ No response received.";
  } catch (err) {
    console.error("❌ Network/Fetch Error:", err);
    return "⚠️ AI request failed. Please check your connection or key.";
  }
}
