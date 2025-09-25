const AIService = require('../services/aiService');

// Initialize AI service with error handling
let aiService;
try {
  aiService = new AIService();
} catch (initError) {
  console.error('Failed to initialize AI Service:', initError.message);
}

const generateContent = async (req, res) => {
  try {
    // Check if AI service initialized properly
    if (!aiService) {
      return res.status(500).json({
        success: false,
        error: 'AI service not available',
        message: 'AI service failed to initialize. Check API key configuration.'
      });
    }

    const { contents, model = 'gemini-2.5-flash' } = req.body;
    
    // Validate request
    if (!contents || typeof contents !== 'string' || !contents.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'Contents field is required and must be a non-empty string'
      });
    }
    
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

        // Generic error with more details
        console.error('Unexpected error in generateContent:', error);
        return res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
  }
};// Debug endpoint to list available models
const listModels = async (req, res) => {
  try {
    if (!aiService) {
      return res.status(500).json({
        success: false,
        error: 'AI service not available'
      });
    }

    const models = await aiService.listAvailableModels();
    return res.status(200).json({
      success: true,
      models: models.map(m => ({ name: m.name, supportedGenerationMethods: m.supportedGenerationMethods }))
    });
  } catch (error) {
    console.error('Error listing models:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to list models',
      message: error.message
    });
  }
};

module.exports = {
  generateContent,
  listModels
};
