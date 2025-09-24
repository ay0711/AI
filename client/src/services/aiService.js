import axios from 'axios';

const API_URL = '/api/ai';

// Add retry logic with exponential backoff
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateContent = async (contents, model = 'gemini-1.5-flash', maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post(`${API_URL}/generate`, { contents, model }, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Attempt ${attempt} - Error generating content:`, error);
      
      // Better error messaging based on status codes
      if (error.response) {
        const { status, data } = error.response;
        
        // Handle rate limiting with retry
        if (status === 429) {
          if (attempt < maxRetries) {
            const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
            console.log(`Rate limited. Retrying in ${waitTime/1000} seconds...`);
            await delay(waitTime);
            continue; // Try again
          } else {
            throw new Error('Rate limit exceeded. Please wait a few minutes before trying again.');
          }
        }
        
        switch (status) {
          case 400:
            throw new Error(data.error || 'Invalid request');
          case 401:
            throw new Error('API key is invalid');
          case 500:
            throw new Error('Server error. Please try again later.');
          default:
            throw new Error(`Error: ${data.error || 'Something went wrong'}`);
        }
      }
      
      if (error.request) {
        throw new Error('Network error. Please check your connection.');
      }
      
      throw error;
    }
  }
};

export default {
  generateContent,
};
