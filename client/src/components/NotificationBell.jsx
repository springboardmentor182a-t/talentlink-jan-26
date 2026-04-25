import { useContext, useRef, useEffect, useState } from "react";
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
  proposal:  "#2563eb",
  message:   "#7c3aed",
  contract:  "#16a34a",
  milestone: "#d97706",
  review:    "#ea580c",
  default:   "#64748b",
};

export default function NotificationBell({ theme = "blue" }) {
  const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification } = useContext(NotificationContext);
  const [open, setOpen] = useState(false);
  const dropdownRef     = useRef(null);

  const accentColor = theme === "purple" ? "#7c3aed" : "#2563eb";

  // ✅ Filter out message notifications from bell
  const bellNotifications = notifications.filter(n => n.type !== "message");
  const bellUnreadCount   = bellNotifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (dt) => {
    if (!dt) return "";
    const d    = new Date(dt);
    const now  = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60)    return "Just now";
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>

      {/* Bell Button */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{ position: "relative", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, transition: "all 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
      >
        🔔
        {/* ✅ Use bellUnreadCount — excludes messages */}
        {bellUnreadCount > 0 && (
          <span style={{ position: "absolute", top: -4, right: -4, backgroundColor: "#ef4444", color: "white", fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white" }}>
            {bellUnreadCount > 9 ? "9+" : bellUnreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="notif-panel" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: "min(360px, calc(100vw - 16px))", backgroundColor: "var(--card)", borderRadius: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.15)", border: "1px solid var(--border)", zIndex: 1000, overflow: "hidden" }}>

          {/* Header */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Notifications</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>{bellUnreadCount} unread</p>
            </div>
            {bellUnreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{ fontSize: 12, color: accentColor, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {bellNotifications.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
                <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>No notifications yet</p>
              </div>
            ) : (
              bellNotifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                  style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-light)", display: "flex", gap: 12, alignItems: "flex-start", backgroundColor: n.is_read ? "var(--card)" : "var(--nav-active-bg)", cursor: n.is_read ? "default" : "pointer", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--page-bg)"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = n.is_read ? "var(--card)" : "var(--nav-active-bg)"}
                >
                  <div style={{ width: 38, height: 38, borderRadius: "50%", backgroundColor: `${typeColor[n.type] || typeColor.default}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {typeIcon[n.type] || typeIcon.default}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <p style={{ fontSize: 13, fontWeight: n.is_read ? 500 : 700, color: "var(--text-primary)", margin: 0, lineHeight: 1.4 }}>{n.title}</p>
                      {!n.is_read && (
                        <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: accentColor, flexShrink: 0, marginTop: 4 }} />
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "3px 0 0", lineHeight: 1.4 }}>{n.message}</p>
                    <p style={{ fontSize: 11, color: "var(--text-faint)", margin: "4px 0 0" }}>{formatTime(n.created_at)}</p>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                    style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", fontSize: 16, padding: "0 4px", flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-faint)"}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}