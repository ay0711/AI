import { useState } from "react";
import { getHistory, clearHistory } from "../utils/helpers";
import "./History.css";

const History = ({ isOpen, onClose, onSelectPrompt }) => {
  const [history, setHistory] = useState(getHistory());

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handleSelectPrompt = (prompt) => {
    onSelectPrompt(prompt);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="history-overlay" onClick={onClose}>
      <div className="history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="history-header">
          <h3>Message History</h3>
          <div className="history-actions">
            <button
              className="history-clear-btn"
              onClick={handleClearHistory}
              disabled={history.length === 0}
            >
              Clear All
            </button>
            <button className="history-close-btn" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="history-content">
          {history.length === 0 ? (
            <div className="history-empty">
              <p>No message history yet.</p>
              <p>Start a conversation to see your history here.</p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-item-header">
                    <span className="history-timestamp">
                      {new Date(item.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div
                    className="history-prompt"
                    onClick={() => handleSelectPrompt(item.prompt)}
                  >
                    {item.prompt}
                  </div>
                  <div className="history-response">
                    {item.response.substring(0, 150)}
                    {item.response.length > 150 && "..."}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
