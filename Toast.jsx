import "./Toast.css";

export default function Toast({ message, type = "success" }) {
  const icons = { success: "✓", error: "✕", info: "ℹ" };
  return (
    <div className={`toast toast--${type}`}>
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-msg">{message}</span>
    </div>
  );
}
