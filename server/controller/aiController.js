const AIService = require('../services/aiService');

// Initialize AI service
const aiService = new AIService();

const generateContent = async (req, res) => {
  try {
    const { contents, model = 'gemini-1.5-flash' } = req.body;
    
    // Use the AI service with integrated retry logic
    const result = await aiService.generateContent(contents, model);
    
    return res.status(200).json({
      success: true,
      text: result.text,
      model: result.model,
      attempt: result.attempt,
      timestamp: result.timestamp
    });

  } catch (error) {
    // Handle specific error types from AI service
    switch (error.code) {
      case 'RATE_LIMIT_EXCEEDED':
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          message: error.message,
          retryAfter: error.retryAfter || 120
        });

      case 'QUOTA_EXCEEDED':
        return res.status(429).json({
          success: false,
          error: 'API quota exceeded',
          message: error.message
        });

      case 'AUTH_ERROR':
        return res.status(401).json({
          success: false,
          error: 'Authentication failed',
          message: error.message
        });

      case 'GENERATION_FAILED':
        return res.status(500).json({
          success: false,
          error: 'Content generation failed',
          message: error.message
        });

      default:
        // Handle validation errors
        if (error.message.includes('Invalid model') || 
            error.message.includes('Contents must be')) {
          return res.status(400).json({
            success: false,
            error: 'Invalid request',
            message: error.message
          });
        }

        // Generic error
        return res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
  }
};module.exports = { generateContent };
