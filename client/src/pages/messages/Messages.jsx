import { useEffect, useState, useContext, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { NotificationContext } from "../../context/NotificationContext";
import api from "../../utils/api";

export default function Messages({ onNavigate }) {
  const { user, role }               = useContext(AuthContext);
  const { enterMessages, leaveMessages } = useContext(NotificationContext);
  const location                     = useLocation();
  const bottomRef                    = useRef(null);
  const inputRef                     = useRef(null);
  const wsRef                        = useRef(null);

  const params         = new URLSearchParams(location.search);
  const initFreelancer = params.get("freelancer");
  const initName       = params.get("name");

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv]       = useState(null);
  const [messages, setMessages]           = useState([]);
  const [text, setText]                   = useState("");
  const [sending, setSending]             = useState(false);
  const [loadingConvs, setLoadingConvs]   = useState(true);
  const [loadingMsgs, setLoadingMsgs]     = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [connected, setConnected]         = useState(false);
  const [showConvList, setShowConvList]   = useState(true);

  // ✅ On mount: clear badge + stop incrementing + mark DB notifications as read
  useEffect(() => {
    enterMessages();
    if (user?.id) {
      api.patch(`/notifications/${user.id}/read-messages`).catch(() => {});
    }
    return () => leaveMessages();
  }, [enterMessages, leaveMessages, user?.id]);

  const isFreelancer = role === "freelancer";
  const theme = isFreelancer
    ? {
        headerBg:    "linear-gradient(135deg,#3b0764 0%,#7c3aed 40%,#a855f7 100%)",
        bubbleBg:    "linear-gradient(135deg,#7c3aed,#a855f7)",
        bubbleShadow:"0 2px 8px rgba(124,58,237,0.35)",
        activeConv:  "#f5f3ff",
        activeBorder:"#7c3aed",
        inputFocus:  "#7c3aed",
        sendBtn:     "linear-gradient(135deg,#7c3aed,#a855f7)",
        sendShadow:  "0 4px 12px rgba(124,58,237,0.4)",
        unreadBg:    "linear-gradient(135deg,#7c3aed,#a855f7)",
        onlineDot:   "#a855f7",
        backLabel:   "← Dashboard",
        backPage:    "dashboard",
      }
    : {
        headerBg:    "linear-gradient(135deg,#1e3a5f 0%,#2563eb 50%,#3b82f6 100%)",
        bubbleBg:    "linear-gradient(135deg,#2563eb,#3b82f6)",
        bubbleShadow:"0 2px 8px rgba(37,99,235,0.35)",
        activeConv:  "#eff6ff",
        activeBorder:"#2563eb",
        inputFocus:  "#2563eb",
        sendBtn:     "linear-gradient(135deg,#2563eb,#3b82f6)",
        sendShadow:  "0 4px 12px rgba(37,99,235,0.4)",
        unreadBg:    "linear-gradient(135deg,#2563eb,#3b82f6)",
        onlineDot:   "#3b82f6",
        backLabel:   "← Contracts",
        backPage:    "contracts",
      };

  const handleBack = () => {
    if (onNavigate) onNavigate(theme.backPage);
  };

  const updateConversationLocally = useCallback((msg) => {
    setConversations(prev => {
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      const existing = prev.find(c => c.other_user_id === otherId);
      if (existing) {
        return prev.map(c =>
          c.other_user_id === otherId
            ? { ...c, last_message: msg.content, last_message_at: msg.created_at }
            : c
        );
      }
      return prev;
    });
  }, [user?.id]);

  const loadConversations = useCallback(async () => {
    try {
      const res = await api.get(`/messages/conversations/${user.id}`);
      setConversations(res.data);
      if (initFreelancer) {
        const existing = res.data.find(c => String(c.other_user_id) === String(initFreelancer));
        if (existing) {
          setActiveConv(existing);
          setShowConvList(false);
        } else {
          setActiveConv({
            id: null,
            other_user_id: parseInt(initFreelancer),
            other_name: decodeURIComponent(initName || `User #${initFreelancer}`),
          });
          setShowConvList(false);
        }
      } else if (res.data.length > 0) {
        setActiveConv(res.data[0]);
      }
    } catch (err) {
      console.error("Conversations error:", err.message);
    } finally {
      setLoadingConvs(false);
    }
  }, [user?.id, initFreelancer, initName]);

  const loadMessages = useCallback(async () => {
    if (!activeConv?.other_user_id) return;
    try {
      setLoadingMsgs(true);
      const res = await api.get(`/messages/${user.id}/${activeConv.other_user_id}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Messages error:", err.message);
    } finally {
      setLoadingMsgs(false);
    }
  }, [user?.id, activeConv?.other_user_id]);

  useEffect(() => {
    if (!activeConv?.other_user_id || !user?.id) return;
    if (wsRef.current) wsRef.current.close();

    const ws = new WebSocket(`ws://localhost:8000/messages/ws/${user.id}/${activeConv.other_user_id}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      updateConversationLocally(msg);
    };
    ws.onclose  = () => setConnected(false);
    ws.onerror  = (err) => { console.error("WebSocket error:", err); setConnected(false); };

    return () => ws.close();
  }, [activeConv?.other_user_id, user?.id, updateConversationLocally]);

  useEffect(() => { if (user) loadConversations(); }, [user, loadConversations]);
  useEffect(() => { if (activeConv) loadMessages(); }, [activeConv?.other_user_id, loadMessages]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !activeConv) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ content: text.trim() }));
      setText("");
      inputRef.current?.focus();
    } else {
      try {
        setSending(true);
        await api.post("/messages/", {
          sender_id:   user.id,
          receiver_id: activeConv.other_user_id,
          content:     text.trim(),
        });
        setText("");
        await loadMessages();
        await loadConversations();
      } catch (err) {
        console.error("Send error:", err.message);
      } finally {
        setSending(false);
        inputRef.current?.focus();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatTime = (dt) => {
    if (!dt) return "";
    return new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDay = (dt) => {
    if (!dt) return "";
    const d     = new Date(dt);
    const today = new Date();
    const diff  = Math.floor((today - d) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const filtered       = conversations.filter(c =>
    (c.other_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const getInitial     = (name) => (name || "?").charAt(0).toUpperCase();
  const avatarColors   = [
    "linear-gradient(135deg,#2563eb,#7c3aed)",
    "linear-gradient(135deg,#7c3aed,#a855f7)",
    "linear-gradient(135deg,#0891b2,#2563eb)",
    "linear-gradient(135deg,#16a34a,#2563eb)",
    "linear-gradient(135deg,#d97706,#ea580c)",
  ];
  const getAvatarColor = (id) => avatarColors[(id || 0) % avatarColors.length];

  return (
    <div style={{ display: "flex", height: "calc(100vh - 56px)", fontFamily: "'Segoe UI',sans-serif", backgroundColor: "var(--page-bg)", overflow: "hidden" }}>
      <style>{`
        @media (max-width: 767px) {
          .msg-conv-panel { display: none !important; }
          .msg-conv-panel.show { display: flex !important; width: 100% !important; }
          .msg-chat-panel { display: none !important; }
          .msg-chat-panel.show { display: flex !important; }
          .msg-back-btn { display: flex !important; }
        }
        @media (min-width: 768px) {
          .msg-conv-panel { display: flex !important; }
          .msg-chat-panel { display: flex !important; }
          .msg-back-btn { display: none !important; }
        }
      `}</style>

      {/* Conversation List Panel */}
      <div className={`msg-conv-panel${showConvList ? " show" : ""}`} style={{ width: 260, flexShrink: 0, borderRight: "1px solid var(--border)", flexDirection: "column", backgroundColor: "var(--card)", overflow: "hidden" }}>
        <div style={{ background: theme.headerBg, padding: "24px 20px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "white", margin: 0, letterSpacing: "-0.5px" }}>Messages</h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: "4px 0 0" }}>
                {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
              </p>
            </div>
            {onNavigate && (
              <button onClick={handleBack}
                style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: "6px 12px", color: "white", fontSize: 12, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>
                {theme.backLabel}
              </button>
            )}
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.6)", fontSize: 14 }}>🔍</span>
            <input
              placeholder="Search conversations..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "9px 12px 9px 32px", backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, fontSize: 13, color: "white", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {loadingConvs && (
            <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Loading...</div>
          )}
          {!loadingConvs && filtered.length === 0 && (
            <div style={{ padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>No conversations yet</p>
              <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 4 }}>
                {isFreelancer ? "Clients will message you once a proposal is accepted" : "Messages from freelancers will appear here"}
              </p>
            </div>
          )}

          {!loadingConvs && initFreelancer && activeConv && !conversations.find(c => String(c.other_user_id) === String(initFreelancer)) && (
            <div style={{ padding: "14px 16px", backgroundColor: theme.activeConv, borderLeft: `3px solid ${theme.activeBorder}`, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: getAvatarColor(parseInt(initFreelancer)), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                {getInitial(decodeURIComponent(initName || "F"))}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{decodeURIComponent(initName || `User #${initFreelancer}`)}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>New conversation</div>
              </div>
            </div>
          )}

          {filtered.map(c => {
            const isActive = activeConv?.other_user_id === c.other_user_id;
            return (
              <div key={c.other_user_id} onClick={() => { setActiveConv(c); setShowConvList(false); }}
                style={{ padding: "14px 16px", cursor: "pointer", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: 12, backgroundColor: isActive ? theme.activeConv : "transparent", borderLeft: isActive ? `3px solid ${theme.activeBorder}` : "3px solid transparent", transition: "all 0.15s" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = "var(--page-bg)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: getAvatarColor(c.other_user_id), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 16, flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                  {getInitial(c.other_name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.other_name || `User #${c.other_user_id}`}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-faint)", flexShrink: 0, marginLeft: 8 }}>{formatDay(c.last_message_at)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                    {c.last_message || "No messages yet"}
                  </div>
                </div>
                {c.unread_count > 0 && (
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: theme.unreadBg, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    {c.unread_count}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`msg-chat-panel${!showConvList ? " show" : ""}`} style={{ flex: 1, minWidth: 0, flexDirection: "column", overflow: "hidden" }}>
        {!activeConv ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 64 }}>💬</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Select a conversation</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>Choose from the sidebar to start messaging</p>
          </div>
        ) : (
          <>
            <div style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)", padding: "16px 24px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <button className="msg-back-btn" onClick={() => setShowConvList(true)}
                style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px 8px 4px 0", fontSize: 20, alignItems: "center" }}
                aria-label="Back to conversations">‹</button>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: getAvatarColor(activeConv.other_user_id), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                {getInitial(activeConv.other_name)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>
                  {activeConv.other_name || `User #${activeConv.other_user_id}`}
                </div>
                <div style={{ fontSize: 12, color: connected ? "#16a34a" : "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: connected ? theme.onlineDot : "#94a3b8", display: "inline-block" }} />
                  {connected ? "Active now" : "Connecting..."}
                </div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 4, backgroundColor: "var(--page-bg)" }}>
              {loadingMsgs && (
                <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, padding: 24 }}>Loading messages...</div>
              )}
              {!loadingMsgs && messages.length === 0 && (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, marginTop: 80 }}>
                  <div style={{ fontSize: 48 }}>👋</div>
                  <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>No messages yet. Say hello!</p>
                </div>
              )}
              {messages.map((m, i) => {
                const isMe    = m.sender_id === user.id;
                const prevMsg = messages[i - 1];
                const showDay = !prevMsg || formatDay(m.created_at) !== formatDay(prevMsg.created_at);
                return (
                  <div key={m.id || i}>
                    {showDay && (
                      <div style={{ textAlign: "center", margin: "12px 0" }}>
                        <span style={{ fontSize: 11, color: "var(--text-faint)", backgroundColor: "var(--muted)", padding: "3px 12px", borderRadius: 20, fontWeight: 600 }}>
                          {formatDay(m.created_at)}
                        </span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: 4 }}>
                      {!isMe && (
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: getAvatarColor(m.sender_id), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 11, marginRight: 8, flexShrink: 0, alignSelf: "flex-end" }}>
                          {getInitial(activeConv.other_name)}
                        </div>
                      )}
                      <div style={{ maxWidth: "65%" }}>
                        <div style={{
                          padding: "10px 14px",
                          borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          background:   isMe ? theme.bubbleBg : "var(--card)",
                          color:        isMe ? "white" : "var(--text-primary)",
                          fontSize: 14, lineHeight: 1.5,
                          boxShadow:    isMe ? theme.bubbleShadow : "0 1px 3px rgba(0,0,0,0.08)",
                          border:       isMe ? "none" : "1px solid var(--border)",
                          wordBreak: "break-word",
                        }}>
                          {m.content}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4, textAlign: isMe ? "right" : "left", paddingLeft: isMe ? 0 : 4, paddingRight: isMe ? 4 : 0 }}>
                          {formatTime(m.created_at)}
                          {isMe && <span style={{ marginLeft: 4 }}>✓✓</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div style={{ backgroundColor: "var(--card)", borderTop: "1px solid var(--border)", padding: "16px 24px", display: "flex", gap: 12, alignItems: "flex-end" }}>
              <textarea
                ref={inputRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message... (Enter to send)"
                rows={1}
                style={{ flex: 1, padding: "12px 16px", border: `1.5px solid ${text ? theme.inputFocus : "var(--border)"}`, borderRadius: 12, fontSize: 14, fontFamily: "inherit", outline: "none", resize: "none", lineHeight: 1.5, maxHeight: 120, overflowY: "auto", transition: "border-color 0.2s" }}
                onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
              />
              <button onClick={sendMessage} disabled={sending || !text.trim()}
                style={{ padding: "12px 20px", background: (sending || !text.trim()) ? "var(--muted)" : theme.sendBtn, color: (sending || !text.trim()) ? "var(--text-faint)" : "white", border: "none", borderRadius: 12, cursor: (sending || !text.trim()) ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 14, boxShadow: (sending || !text.trim()) ? "none" : theme.sendShadow, transition: "all 0.2s", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
                {sending ? "..." : "Send ➤"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}