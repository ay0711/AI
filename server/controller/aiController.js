const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

const generateContent = async (req, res) => {
  try {
    const { contents, model = 'gemini-1.5-flash' } = req.body;
    
    // Input validation
    if (!contents || typeof contents !== 'string' || contents.trim() === '') {
      return res.status(400).json({ error: 'Contents parameter is required and must be a non-empty string' });
    }

    // Validate model
    const validModels = ['gemini-1.5-flash', 'gemini-1.5-pro'];
    if (!validModels.includes(model)) {
      return res.status(400).json({ error: 'Invalid model specified' });
    }

    const modelInstance = genAI.getGenerativeModel({ model });
    const result = await modelInstance.generateContent(contents);
    const response = await result.response;
    const text = response.text();
    
    res.json({ text });
  } catch (error) {
    console.error('Error generating content:', error);
    
    // Better error handling
    if (error.message.includes('API key')) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    if (error.message.includes('quota')) {
      return res.status(429).json({ error: 'API quota exceeded' });
    }
    
    res.status(500).json({ error: 'Error generating content' });
  }
};

module.exports = { generateContent };
