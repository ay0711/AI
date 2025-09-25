const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIService {
  constructor() {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY environment variable is required");
    }
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.validModels = ["gemini-1.5-flash", "gemini-1.5-pro"];
  }

  // Helper function for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Validate model
  isValidModel(model) {
    return this.validModels.includes(model);
  }

  // Generate content with retry logic
  async generateContent(contents, model = "gemini-1.5-flash", maxRetries = 3) {
    if (!this.isValidModel(model)) {
      throw new Error(`Invalid model. Supported models: ${this.validModels.join(", ")}`);
    }

    if (!contents || typeof contents !== 'string' || !contents.trim()) {
      throw new Error("Contents must be a non-empty string");
    }

    const aiModel = this.genAI.getGenerativeModel({ model });
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await aiModel.generateContent(contents.trim());
        const response = await result.response;
        const text = response.text();

        if (!text || text.trim().length === 0) {
          throw new Error("Empty response received from AI model");
        }

        return {
          text: text.trim(),
          model: model,
          attempt: attempt,
          timestamp: new Date().toISOString()
        };

      } catch (error) {
        lastError = error;

        // Handle rate limiting
        if (this.isRateLimitError(error)) {
          if (attempt < maxRetries) {
            const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
            await this.delay(waitTime);
            continue;
          } else {
            const rateLimitError = new Error("Rate limit exceeded. Please wait a few minutes before trying again.");
            rateLimitError.code = 'RATE_LIMIT_EXCEEDED';
            rateLimitError.retryAfter = 120;
            throw rateLimitError;
          }
        }

        // Handle quota exceeded
        if (this.isQuotaError(error)) {
          const quotaError = new Error("API quota exceeded. Please try again tomorrow or upgrade your plan.");
          quotaError.code = 'QUOTA_EXCEEDED';
          throw quotaError;
        }

        // Handle authentication errors
        if (this.isAuthError(error)) {
          const authError = new Error("Invalid API key. Please check your configuration.");
          authError.code = 'AUTH_ERROR';
          throw authError;
        }

        // Retry for temporary errors
        if (attempt < maxRetries && this.isRetryableError(error)) {
          const waitTime = Math.pow(2, attempt) * 1000;
          await this.delay(waitTime);
          continue;
        }

        // Break on permanent errors or last attempt
        break;
      }
    }

    // All attempts failed
    const finalError = new Error(`Content generation failed after ${maxRetries} attempts: ${lastError?.message}`);
    finalError.originalError = lastError;
    finalError.code = 'GENERATION_FAILED';
    throw finalError;
  }

  // Error type checkers
  isRateLimitError(error) {
    return error.message?.includes('RATE_LIMIT_EXCEEDED') || 
           error.message?.includes('429') ||
           error.status === 429 ||
           error.code === 429;
  }

  isQuotaError(error) {
    return error.message?.includes('RESOURCE_EXHAUSTED') || 
           error.message?.includes('quota') ||
           error.message?.includes('QUOTA_EXCEEDED');
  }

  isAuthError(error) {
    return error.message?.includes('API_KEY_INVALID') || 
           error.message?.includes('401') ||
           error.status === 401;
  }

  isRetryableError(error) {
    return error.message?.includes('INTERNAL') || 
           error.message?.includes('UNAVAILABLE') ||
           error.code === 'ECONNRESET' ||
           error.code === 'ETIMEDOUT' ||
           error.code === 'ENOTFOUND';
  }
}

module.exports = AIService;