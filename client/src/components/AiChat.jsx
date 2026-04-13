import { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";

const BOT_AVATAR = "🤖";
const USER_AVATAR = "👤";

export default function AiChat() {
  const { user } = useContext(AuthContext);

  const storageKey = `aichat_history_${user?.id || "guest"}`;

  const getInitialMessages = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        role: "assistant",
        content: `Hi ${user?.name?.split(" ")[0] || "there"}! 👋 I'm your TalentLink AI assistant. Ask me anything about projects, proposals, budgets, or freelancing tips!`,
      },
    ];
  };

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(getInitialMessages);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Save to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {}
  }, [messages, storageKey]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const clearHistory = () => {
    const fresh = [
      {
        role: "assistant",
        content: `Hi ${user?.name?.split(" ")[0] || "there"}! 👋 I'm your TalentLink AI assistant. Ask me anything about projects, proposals, budgets, or freelancing tips!`,
      },
    ];
    setMessages(fresh);
    localStorage.removeItem(storageKey);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const history = updatedMessages.slice(1, -1);
      const res = await api.post("/ai/chat", { message: text, history });
      setMessages([...updatedMessages, { role: "assistant", content: res.data.reply }]);
    } catch {
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={styles.fab}
        title="AI Assistant"
        aria-label="Open AI Chat"
      >
        {open ? "✕" : "✨"}
      </button>

      {/* Chat Window */}
      {open && (
        <div style={styles.window}>
          {/* Header */}
          <div style={styles.header}>
            <span style={styles.headerIcon}>🤖</span>
            <div>
              <div style={styles.headerTitle}>TalentLink AI</div>
              <div style={styles.headerSub}>Always here to help</div>
            </div>
            <button onClick={clearHistory} title="Clear chat" style={styles.clearBtn}>
              🗑️
            </button>
            <button onClick={() => setOpen(false)} style={styles.closeBtn}>✕</button>
          </div>

          {/* Messages */}
          <div style={styles.messages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...styles.msgRow,
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                }}
              >
                <span style={styles.avatar}>
                  {msg.role === "user" ? USER_AVATAR : BOT_AVATAR}
                </span>
                <div
                  style={{
                    ...styles.bubble,
                    ...(msg.role === "user" ? styles.userBubble : styles.botBubble),
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ ...styles.msgRow, flexDirection: "row" }}>
                <span style={styles.avatar}>{BOT_AVATAR}</span>
                <div style={{ ...styles.bubble, ...styles.botBubble, ...styles.typing }}>
                  <span style={styles.dot} />
                  <span style={{ ...styles.dot, animationDelay: "0.2s" }} />
                  <span style={{ ...styles.dot, animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={styles.inputRow}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything..."
              rows={1}
              style={styles.textarea}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{
                ...styles.sendBtn,
                opacity: !input.trim() || loading ? 0.5 : 1,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}

const styles = {
  fab: {
    position: "fixed",
    bottom: "28px",
    right: "28px",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    fontSize: "22px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(99,102,241,0.5)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s",
  },
  window: {
    position: "fixed",
    bottom: "96px",
    right: "28px",
    width: "360px",
    height: "500px",
    borderRadius: "16px",
    background: "#fff",
    boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
    display: "flex",
    flexDirection: "column",
    zIndex: 9998,
    overflow: "hidden",
    fontFamily: "system-ui, sans-serif",
  },
  header: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#fff",
  },
  headerIcon: { fontSize: "26px" },
  headerTitle: { fontWeight: "700", fontSize: "15px" },
  headerSub: { fontSize: "11px", opacity: 0.8 },
  clearBtn: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    opacity: 0.8,
    padding: "0 4px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    opacity: 0.8,
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    background: "#f8f9ff",
  },
  msgRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
  },
  avatar: { fontSize: "18px", flexShrink: 0 },
  bubble: {
    maxWidth: "75%",
    padding: "10px 14px",
    borderRadius: "16px",
    fontSize: "13.5px",
    lineHeight: "1.5",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  userBubble: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    borderBottomRightRadius: "4px",
  },
  botBubble: {
    background: "#fff",
    color: "#1e1e2e",
    border: "1px solid #e5e7eb",
    borderBottomLeftRadius: "4px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  typing: {
    display: "flex",
    gap: "4px",
    alignItems: "center",
    padding: "12px 16px",
  },
  dot: {
    display: "inline-block",
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#6366f1",
    animation: "bounce 1.2s infinite ease-in-out",
  },
  inputRow: {
    display: "flex",
    gap: "8px",
    padding: "12px",
    borderTop: "1px solid #e5e7eb",
    background: "#fff",
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    resize: "none",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "13.5px",
    outline: "none",
    fontFamily: "inherit",
    lineHeight: "1.4",
    background: "#f8f9ff",
    maxHeight: "80px",
    overflowY: "auto",
  },
  sendBtn: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
};