import { useState, useEffect, useRef } from 'react';
import aiService from './services/aiService';
import Toast from './components/Toast';
import History from './components/History';
import PromptTemplates from './components/PromptTemplates';
import { 
  copyToClipboard, 
  saveToHistory, 
  exportResponse, 
  formatResponse,
  getTheme,
  setTheme
} from './utils/helpers';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success', isVisible: false });
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [theme, setCurrentTheme] = useState(getTheme());
  const selectedModel = 'gemini-1.5-flash';
  const [charCount, setCharCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const textareaRef = useRef(null);
  const lastPromptRef = useRef('');

  // Initialize theme on mount
  useEffect(() => {
    setTheme(theme);
  }, []);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Handle input change with character count
  const handleInputChange = (e) => {
    const value = e.target.value;
    setPrompt(value);
    setCharCount(value.length);
    adjustTextareaHeight();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (!isLoading && prompt.trim()) {
          handleSubmit(e);
        }
      } else if (e.key === 'Escape') {
        setPrompt('');
        setCharCount(0);
        setError('');
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      } else if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [prompt, isLoading]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    setTheme(newTheme);
    showToast(`Switched to ${newTheme} theme`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a message before sending.');
      return;
    }

    setIsLoading(true);
    setIsRetrying(false);
    setRetryCount(0);
    setError('');
    setResponse('');
    const currentPrompt = prompt;
    lastPromptRef.current = currentPrompt;
    setPrompt('');
    setCharCount(0);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Store original console.log outside try block
    const originalConsoleLog = console.log;
    
    try {
      // Add retry monitoring
      console.log = (message) => {
        if (message.includes('Rate limited. Retrying')) {
          setIsRetrying(true);
          const match = message.match(/Retrying in (\d+) seconds/);
          if (match) {
            setRetryCount(prev => prev + 1);
            showToast(`Rate limited. Retrying in ${match[1]} seconds... (Attempt ${retryCount + 1})`, 'info');
          }
        }
        originalConsoleLog(message);
      };

      const data = await aiService.generateContent(currentPrompt, selectedModel);
      
      setResponse(data.text);
      saveToHistory(currentPrompt, data.text);
      showToast('Response generated successfully!');
    } catch (err) {
      
      setError(err.message || 'Failed to generate content. Please try again.');
      setPrompt(currentPrompt); // Restore prompt on error
      setCharCount(currentPrompt.length);
      adjustTextareaHeight();
      
      // Special handling for rate limit errors
      if (err.message.includes('Rate limit exceeded')) {
        showToast('Rate limit reached. Please wait a few minutes before trying again.', 'error');
      } else {
        showToast('Failed to generate response', 'error');
      }
    } finally {
      // Always restore console.log
      console.log = originalConsoleLog;
      setIsLoading(false);
      setIsRetrying(false);
      setRetryCount(0);
    }
  };

  const handleCopyResponse = async () => {
    if (response) {
      const success = await copyToClipboard(response);
      showToast(success ? 'Response copied to clipboard!' : 'Failed to copy response', success ? 'success' : 'error');
    }
  };

  const handleExportResponse = () => {
    if (response) {
      exportResponse(lastPromptRef.current, response);
      showToast('Response exported successfully!');
    }
  };

  const handleSelectTemplate = (templatePrompt) => {
    setPrompt(templatePrompt);
    setCharCount(templatePrompt.length);
    if (textareaRef.current) {
      textareaRef.current.focus();
      setTimeout(adjustTextareaHeight, 0);
    }
    showToast('Template loaded!');
  };

  const handleSelectFromHistory = (historicPrompt) => {
    setPrompt(historicPrompt);
    setCharCount(historicPrompt.length);
    if (textareaRef.current) {
      textareaRef.current.focus();
      setTimeout(adjustTextareaHeight, 0);
    }
    showToast('Prompt loaded from history!');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>AI Content Generator</h1>
            <p>Powered by Google's Gemini</p>
          </div>
          <div className="header-actions">
            <button 
              className="action-btn"
              onClick={() => setShowTemplates(true)}
              title="Prompt Templates"
            >
              📝
            </button>
            <button 
              className="action-btn"
              onClick={() => setShowHistory(true)}
              title="Message History"
            >
              🕐
            </button>
            <button 
              className="action-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      <main>
        <form onSubmit={handleSubmit} className="prompt-form">
          <div className="textarea-container">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={handleInputChange}
              placeholder="Enter your prompt here... (Ctrl+Enter to send, Escape to clear)"
              className="prompt-textarea"
              disabled={isLoading}
              rows={3}
            />
            <div className="textarea-footer">
              <div className="char-counter">
                <span className={charCount > 1000 ? 'warning' : charCount > 2000 ? 'danger' : ''}>
                  {charCount} characters
                </span>
              </div>
              <div className="keyboard-hints">
                <span>Ctrl+Enter to send • Escape to clear</span>
              </div>
            </div>
          </div>
          <button type="submit" className="generate-button" disabled={isLoading}>
            {isLoading ? (
              <div className="loading-content">
                <span className="loader"></span>
                {isRetrying ? `Retrying... (${retryCount}/3)` : 'Generating...'}
              </div>
            ) : 'SEND'}
          </button>
        </form>

        {error && (
          <div className={`error-message ${error.includes('Rate limit') ? 'rate-limit-error' : ''}`}>
            {error}
            {error.includes('Rate limit') && (
              <div className="rate-limit-tips">
                <p><strong>💡 Tips to avoid rate limits:</strong></p>
                <ul>
                  <li>Wait 1-2 minutes between requests</li>
                  <li>Use shorter prompts when possible</li>
                  <li>Switch to Gemini Flash for faster processing</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {response && (
          <div className="response-container">
            <div className="response-header">
              <h2>Generated Content</h2>
              <div className="response-actions">
                <button 
                  className="action-btn small"
                  onClick={handleCopyResponse}
                  title="Copy to clipboard"
                >
                  📋
                </button>
                <button 
                  className="action-btn small"
                  onClick={handleExportResponse}
                  title="Export as text file"
                >
                  💾
                </button>
              </div>
            </div>
            <div 
              className="response-content"
              dangerouslySetInnerHTML={{ __html: formatResponse(response) }}
            />
          </div>
        )}
      </main>

      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <History 
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectPrompt={handleSelectFromHistory}
      />

      <PromptTemplates 
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}

export default App;

