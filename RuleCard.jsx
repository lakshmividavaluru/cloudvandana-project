import { useState } from "react";
import "./RuleCard.css";

export default function RuleCard({ rule, isPending, onToggle }) {
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await onToggle(rule.Id, rule.Active);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className={`rule-card ${isPending ? "rule-card--pending" : ""} ${rule.Active ? "rule-card--active" : "rule-card--inactive"}`}>
      {isPending && <div className="rule-pending-bar" />}

      <div className="rule-card-header">
        <div className="rule-name-row">
          <span className="rule-name">{rule.ValidationName}</span>
          <span className={`rule-status-badge ${rule.Active ? "badge--active" : "badge--inactive"}`}>
            {rule.Active ? "Active" : "Inactive"}
          </span>
        </div>
        {isPending && (
          <span className="rule-pending-tag">● unsaved</span>
        )}
      </div>

      {rule.Description && (
        <p className="rule-description">{rule.Description}</p>
      )}

      <div className="rule-meta">
        {rule.ErrorMessage && (
          <div className="rule-meta-item">
            <span className="rule-meta-label">Error Message</span>
            <span className="rule-meta-value">{rule.ErrorMessage}</span>
          </div>
        )}
        {rule.ErrorDisplayField && (
          <div className="rule-meta-item">
            <span className="rule-meta-label">Display Field</span>
            <span className="rule-meta-value mono">{rule.ErrorDisplayField}</span>
          </div>
        )}
        <div className="rule-meta-item">
          <span className="rule-meta-label">Rule ID</span>
          <span className="rule-meta-value mono id-truncate">{rule.Id}</span>
        </div>
      </div>

      <div className="rule-card-footer">
        <button
          className={`rule-toggle-btn ${rule.Active ? "toggle--deactivate" : "toggle--activate"}`}
          onClick={handleToggle}
          disabled={toggling}
        >
          {toggling ? (
            <><span className="btn-spinner" /> Working…</>
          ) : rule.Active ? (
            "⊘  Deactivate"
          ) : (
            "✓  Activate"
          )}
        </button>
      </div>
    </div>
  );
}
