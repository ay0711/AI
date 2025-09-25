import axios from 'axios';

// Configure API URL based on environment
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://ai-k0yd.onrender.com/api/ai'  // Your deployed backend
  : 'http://localhost:5000/api/ai';

const generateContent = async (contents, model = 'gemini-1.5-flash') => {
  try {
    const response = await axios.post(`${API_URL}/generate`, 
      { contents, model },
      {
        timeout: 60000, // 60 second timeout (backend handles retries)
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;

  } catch (error) {
    if (error.response) {
      // Backend returned an error response
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data.message || 'Invalid request');
        case 401:
          throw new Error(data.message || 'API authentication failed');
        case 429:
          throw new Error(data.message || 'Rate limit exceeded');
        case 500:
          throw new Error(data.message || 'Server error');
        default:
          throw new Error(data.message || `Request failed with status ${status}`);
      }
    } else if (error.request) {
      // Network error - backend not reachable
      throw new Error('Cannot connect to backend server. Please check if the server is running.');
    } else {
      // Other error
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

export default {
  generateContent,
};
