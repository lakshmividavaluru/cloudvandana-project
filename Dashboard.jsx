import { useState, useCallback } from "react";
import {
  fetchValidationRules,
  toggleValidationRule,
  toggleAllRules,
  deployRuleChanges,
} from "../services/toolingAPI";
import RuleCard from "./RuleCard";
import Toast from "./Toast";
import "./Dashboard.css";

export default function Dashboard({ auth, onLogout }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const [toast, setToast] = useState(null);
  const [fetched, setFetched] = useState(false);
  const [togglingAll, setTogglingAll] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchValidationRules(auth.instanceUrl, auth.accessToken);
      setRules(data);
      setPendingChanges({});
      setFetched(true);
      showToast(`Fetched ${data.length} validation rule${data.length !== 1 ? "s" : ""}`);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [auth]);

  const handleToggleRule = useCallback(async (ruleId, currentActive) => {
    // Optimistic update
    setRules((prev) =>
      prev.map((r) => (r.Id === ruleId ? { ...r, Active: !currentActive } : r))
    );
    setPendingChanges((prev) => ({ ...prev, [ruleId]: !currentActive }));
    showToast(`Rule ${!currentActive ? "activated" : "deactivated"} — remember to deploy!`, "info");
  }, []);

  const handleToggleAll = useCallback(async (targetState) => {
    setTogglingAll(true);
    try {
      const updated = await toggleAllRules(
        auth.instanceUrl,
        auth.accessToken,
        rules,
        targetState
      );
      setRules(updated);
      const changes = {};
      updated.forEach((r) => { changes[r.Id] = r.Active; });
      setPendingChanges(changes);
      showToast(`All rules ${targetState ? "activated" : "deactivated"}`);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setTogglingAll(false);
    }
  }, [auth, rules]);

  const handleDeploy = useCallback(async () => {
    if (Object.keys(pendingChanges).length === 0) {
      showToast("No pending changes to deploy", "info");
      return;
    }
    setDeploying(true);
    try {
      const { succeeded, failed } = await deployRuleChanges(
        auth.instanceUrl,
        auth.accessToken,
        pendingChanges
      );
      if (failed.length === 0) {
        showToast(`✓ Deployed ${succeeded.length} change${succeeded.length !== 1 ? "s" : ""} to Salesforce`);
        setPendingChanges({});
      } else {
        showToast(`${succeeded.length} deployed, ${failed.length} failed`, "error");
      }
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setDeploying(false);
    }
  }, [auth, pendingChanges]);

  const activeCount = rules.filter((r) => r.Active).length;
  const inactiveCount = rules.length - activeCount;
  const pendingCount = Object.keys(pendingChanges).length;

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-header-left">
          <div className="dash-logo">
            <div className="dash-logo-icon">⬡</div>
            <div>
              <h1 className="dash-title">SF Rule Manager</h1>
              <p className="dash-org">{auth.instanceUrl.replace("https://", "")}</p>
            </div>
          </div>
        </div>
        <div className="dash-header-right">
          {pendingCount > 0 && (
            <div className="pending-badge">{pendingCount} pending</div>
          )}
          <button
            className="btn btn-success"
            onClick={handleDeploy}
            disabled={deploying || pendingCount === 0}
          >
            {deploying ? <><span className="btn-spinner" /> Deploying…</> : "🚀 Deploy Changes"}
          </button>
          <button className="btn btn-ghost" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </header>

      {/* Stats bar */}
      {fetched && (
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-num">{rules.length}</span>
            <span className="stat-label">Total Rules</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num active">{activeCount}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num inactive">{inactiveCount}</span>
            <span className="stat-label">Inactive</span>
          </div>
          {pendingCount > 0 && (
            <>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-num pending">{pendingCount}</span>
                <span className="stat-label">Pending Deploy</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="dash-toolbar">
        <button
          className="btn btn-primary"
          onClick={handleFetchRules}
          disabled={loading}
        >
          {loading ? <><span className="btn-spinner" /> Fetching…</> : "⟳  Fetch Validation Rules"}
        </button>

        {fetched && rules.length > 0 && (
          <div className="bulk-actions">
            <button
              className="btn btn-secondary"
              onClick={() => handleToggleAll(true)}
              disabled={togglingAll}
            >
              ✓ Activate All
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => handleToggleAll(false)}
              disabled={togglingAll}
            >
              ✕ Deactivate All
            </button>
          </div>
        )}
      </div>

      {/* Rules list */}
      <main className="rules-area">
        {!fetched && (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <p className="empty-title">No rules loaded</p>
            <p className="empty-sub">Click "Fetch Validation Rules" to load Account rules from your org</p>
          </div>
        )}

        {fetched && rules.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">⊘</div>
            <p className="empty-title">No validation rules found</p>
            <p className="empty-sub">Create some validation rules on the Account object in your Salesforce org</p>
          </div>
        )}

        {rules.length > 0 && (
          <div className="rules-grid">
            {rules.map((rule) => (
              <RuleCard
                key={rule.Id}
                rule={rule}
                isPending={rule.Id in pendingChanges}
                onToggle={handleToggleRule}
              />
            ))}
          </div>
        )}
      </main>

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}
