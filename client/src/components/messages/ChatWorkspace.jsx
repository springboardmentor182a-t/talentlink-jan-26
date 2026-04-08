import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ChatWorkspace.css";
import {
  fetchConversation,
  fetchConversations,
  sendMessage,
  startConversation,
} from "../../services/messageService";

const formatTime = (value) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const ChatWorkspace = ({ emptyTitle = "Messages", onProfileLoaded }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const syncProfile = (userProfile) => {
    if (onProfileLoaded) {
      onProfileLoaded(userProfile);
    }
  };

  const loadConversations = async () => {
    const data = await fetchConversations();
    syncProfile(data.current_user);
    setConversations(Array.isArray(data.conversations) ? data.conversations : []);
    return data;
  };

  const openConversation = async (conversationId) => {
    const detail = await fetchConversation(conversationId);
    setActiveConversation(detail);
  };

  useEffect(() => {
    let isCancelled = false;

    const initialize = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await loadConversations();
        if (isCancelled) {
          return;
        }

        const conversationId = searchParams.get("conversation");
        const proposalId = searchParams.get("proposal");
        const userId = searchParams.get("user");

        if (conversationId) {
          await openConversation(conversationId);
        } else if (proposalId || userId) {
          const created = await startConversation({
            proposalId: proposalId ? Number(proposalId) : null,
            otherUserId: userId ? Number(userId) : null,
          });
          if (isCancelled) {
            return;
          }
          setActiveConversation(created);
          const refreshed = await loadConversations();
          if (isCancelled) {
            return;
          }
          if (!refreshed.conversations.find((item) => item.id === created.id)) {
            setConversations((current) => [
              {
                id: created.id,
                created_at: created.created_at,
                updated_at: created.updated_at,
                other_user: created.other_user,
                proposal: created.proposal,
                last_message: null,
                message_count: created.messages.length,
              },
              ...current,
            ]);
          }
          navigate(location.pathname, { replace: true });
        } else if (data.conversations.length > 0) {
          await openConversation(data.conversations[0].id);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || "Failed to load messages");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    initialize();
    return () => {
      isCancelled = true;
    };
  }, [location.pathname, navigate, searchParams]);

  const handleSelectConversation = async (conversationId) => {
    setError("");
    try {
      await openConversation(conversationId);
    } catch (err) {
      setError(err.message || "Failed to open conversation");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!activeConversation || !draft.trim()) {
      return;
    }

    setIsSending(true);
    setError("");
    try {
      await sendMessage(activeConversation.id, draft);
      setDraft("");
      await openConversation(activeConversation.id);
      await loadConversations();
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-shell">
        <aside className="conversation-list-panel">
          <div className="conversation-list-header">
            <h1>{emptyTitle}</h1>
            <p>Client and freelancer conversations appear here.</p>
          </div>

          {isLoading && <p className="chat-placeholder">Loading conversations...</p>}
          {!isLoading && error && !activeConversation && (
            <p className="chat-placeholder">{error}</p>
          )}
          {!isLoading && !error && conversations.length === 0 && (
            <p className="chat-placeholder">
              No conversations yet. Start one from a proposal card.
            </p>
          )}

          <div className="conversation-list">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`conversation-item ${
                  activeConversation?.id === conversation.id ? "active" : ""
                }`}
                onClick={() => handleSelectConversation(conversation.id)}
              >
                <div className="conversation-item-top">
                  <strong>{conversation.other_user.full_name}</strong>
                  <span>{formatTime(conversation.updated_at)}</span>
                </div>
                <p className="conversation-role">{conversation.other_user.role}</p>
                <p className="conversation-preview">
                  {conversation.last_message?.content ||
                    conversation.proposal?.title ||
                    "Start the conversation"}
                </p>
              </button>
            ))}
          </div>
        </aside>

        <section className="chat-panel">
          {!activeConversation && !isLoading && (
            <div className="chat-empty-state">
              <h2>Select a conversation</h2>
              <p>Choose a conversation from the left to view messages.</p>
            </div>
          )}

          {activeConversation && (
            <>
              <div className="chat-panel-header">
                <div>
                  <h2>{activeConversation.other_user.full_name}</h2>
                  <p>
                    {activeConversation.other_user.role}
                    {activeConversation.proposal
                      ? ` • ${activeConversation.proposal.title}`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="chat-message-list">
                {activeConversation.messages.length === 0 && (
                  <div className="chat-empty-state subtle">
                    <p>No messages yet. Say hello to get started.</p>
                  </div>
                )}

                {activeConversation.messages.map((message) => {
                  const isOwnMessage =
                    message.sender_id === activeConversation.current_user.id;
                  return (
                    <div
                      key={message.id}
                      className={`chat-bubble-row ${isOwnMessage ? "own" : ""}`}
                    >
                      <div className={`chat-bubble ${isOwnMessage ? "own" : ""}`}>
                        <p>{message.content}</p>
                        <span>
                          {message.sender_name} • {formatTime(message.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form className="chat-composer" onSubmit={handleSubmit}>
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message..."
                  rows={3}
                />
                <div className="chat-composer-actions">
                  {error && <p className="chat-error">{error}</p>}
                  <button type="submit" disabled={isSending || !draft.trim()}>
                    {isSending ? "Sending..." : "Send"}
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default ChatWorkspace;
