import { useState } from "react";
import { promptTemplates } from "../utils/helpers";
import "./PromptTemplates.css";

const PromptTemplates = ({ isOpen, onClose, onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    "All",
    ...new Set(promptTemplates.map((t) => t.category)),
  ];

  const filteredTemplates = promptTemplates.filter((template) => {
    const matchesCategory =
      selectedCategory === "All" || template.category === selectedCategory;
    const matchesSearch =
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectTemplate = (template) => {
    onSelectTemplate(template.prompt);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="templates-overlay" onClick={onClose}>
      <div className="templates-modal" onClick={(e) => e.stopPropagation()}>
        <div className="templates-header">
          <h3>Prompt Templates</h3>
          <button className="templates-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="templates-filters">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="templates-search"
          />
          <div className="templates-categories">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-btn ${
                  selectedCategory === category ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="templates-content">
          {filteredTemplates.length === 0 ? (
            <div className="templates-empty">
              <p>No templates found matching your criteria.</p>
            </div>
          ) : (
            <div className="templates-grid">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="template-card"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="template-header">
                    <h4 className="template-title">{template.title}</h4>
                    <span className="template-category">
                      {template.category}
                    </span>
                  </div>
                  <p className="template-prompt">{template.prompt}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptTemplates;
