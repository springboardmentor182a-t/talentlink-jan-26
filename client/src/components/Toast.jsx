import { useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";

const typeIcon = {
  proposal:  "📋",
  message:   "💬",
  contract:  "📄",
  milestone: "🎯",
  review:    "⭐",
  default:   "🔔",
};

const typeColor = {
  proposal:  { bg: "#eff6ff", border: "#2563eb", text: "#1e40af" },
  message:   { bg: "#f5f3ff", border: "#7c3aed", text: "#5b21b6" },
  contract:  { bg: "#f0fdf4", border: "#16a34a", text: "#15803d" },
  milestone: { bg: "#fffbeb", border: "#d97706", text: "#b45309" },
  review:    { bg: "#fff7ed", border: "#ea580c", text: "#c2410c" },
  default:   { bg: "#f8fafc", border: "#64748b", text: "#475569" },
};

export default function Toast() {
  const { toasts, removeToast } = useContext(NotificationContext);

  if (toasts.length === 0) return null;

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, maxWidth: 360 }}>
      {toasts.map(toast => {
        const colors = typeColor[toast.type] || typeColor.default;
        return (
          <div
            key={toast.toastId}
            style={{
              backgroundColor: colors.bg,
              border: `1.5px solid ${colors.border}`,
              borderRadius: 12,
              padding: "14px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              animation: "slideIn 0.3s ease",
              minWidth: 300,
            }}
          >
            <style>{`
              @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to   { transform: translateX(0);    opacity: 1; }
              }
            `}</style>

            {/* Icon */}
            <div style={{ fontSize: 22, flexShrink: 0 }}>
              {typeIcon[toast.type] || typeIcon.default}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: colors.text, margin: 0, lineHeight: 1.4 }}>
                {toast.title}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "3px 0 0", lineHeight: 1.4 }}>
                {toast.message}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={() => removeToast(toast.toastId)}
              style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", fontSize: 18, padding: 0, flexShrink: 0, lineHeight: 1 }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-faint)"}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}