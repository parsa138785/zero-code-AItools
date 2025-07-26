const axios = require("axios");

class MetisAIService {
  constructor() {
    this.apiKey = process.env.METIS_API_KEY;
    this.baseURL = process.env.METIS_BASE_URL || "https://api.metisai.ir/openai/v1";
    
    if (!this.apiKey) {
      console.warn("METIS_API_KEY not found in environment variables");
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 30000
    });
  }

  async generateCompletion({ systemPrompt, userPrompt, model = "gpt-4o-mini", maxTokens = 1000, temperature = 0.7 }) {
    try {
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ];

      const response = await this.client.post("/chat/completions", {
        model,
        messages,
        max_tokens: maxTokens,
        temperature
      });

      return {
        success: true,
        content: response.data.choices[0].message.content,
        usage: response.data.usage
      };
    } catch (error) {
      console.error("MetisAI API Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  async generateChatCompletion({ messages, model = "gpt-4o-mini", maxTokens = 1000, temperature = 0.7 }) {
    try {
      const response = await this.client.post("/chat/completions", {
        model,
        messages,
        max_tokens: maxTokens,
        temperature
      });

      return {
        success: true,
        content: response.data.choices[0].message.content,
        usage: response.data.usage
      };
    } catch (error) {
      console.error("MetisAI API Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }
}

module.exports = new MetisAIService();

