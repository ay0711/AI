// Utility functions for the AI app

// Copy text to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

// Local storage helpers for message history
export const saveToHistory = (prompt, response) => {
  const history = getHistory();
  const newEntry = {
    id: Date.now(),
    prompt,
    response,
    timestamp: new Date().toISOString(),
  };
  const updatedHistory = [newEntry, ...history.slice(0, 49)]; // Keep last 50
  localStorage.setItem('ai-chat-history', JSON.stringify(updatedHistory));
};

export const getHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('ai-chat-history')) || [];
  } catch {
    return [];
  }
};

export const clearHistory = () => {
  localStorage.removeItem('ai-chat-history');
};

// Theme management
export const getTheme = () => {
  return localStorage.getItem('ai-app-theme') || 'light';
};

export const setTheme = (theme) => {
  localStorage.setItem('ai-app-theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
};

// Export response as text file
export const exportResponse = (prompt, response) => {
  const content = `Prompt: ${prompt}\n\nResponse:\n${response}\n\nGenerated on: ${new Date().toLocaleString()}`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-response-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Format response text with basic markdown-style formatting
export const formatResponse = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/`(.*?)`/g, '<code>$1</code>') // Inline code
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>') // Code blocks
    .replace(/\n- /g, '\n• ') // Bullet points
    .replace(/\n(\d+\. )/g, '\n$1'); // Numbered lists
};

// Prompt templates
export const promptTemplates = [
  {
    id: 1,
    title: "Professional Email",
    prompt: "Write a professional email about: [topic]",
    category: "Business"
  },
  {
    id: 2,
    title: "Explain Simply",
    prompt: "Explain the following concept in simple terms that anyone can understand: [concept]",
    category: "Education"
  },
  {
    id: 3,
    title: "Social Media Post",
    prompt: "Create an engaging social media post about: [topic]",
    category: "Marketing"
  },
  {
    id: 4,
    title: "Code Review",
    prompt: "Please review this code and suggest improvements: [code]",
    category: "Development"
  },
  {
    id: 5,
    title: "Creative Writing",
    prompt: "Write a creative story about: [theme]",
    category: "Creative"
  },
  {
    id: 6,
    title: "Problem Solving",
    prompt: "Help me solve this problem step by step: [problem]",
    category: "Analysis"
  },
  {
    id: 7,
    title: "Meeting Summary",
    prompt: "Summarize the key points from this meeting: [meeting notes]",
    category: "Business"
  },
  {
    id: 8,
    title: "Recipe Creation",
    prompt: "Create a recipe for: [dish/ingredients]",
    category: "Cooking"
  }
];