import React, { useEffect, useMemo, useState } from 'react';
import './Messages.css';

const getInitials = (name) => {
  if (!name) {
    return '?';
  }
  const parts = name.split(' ').filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]);
  return initials.join('').toUpperCase();
};

const normalizeConversation = (conversation, index) => {
  const name = conversation?.name || conversation?.clientName || conversation?.title || 'Client';
  return {
    id: conversation?.id ?? conversation?.conversationId ?? conversation?.threadId ?? index + 1,
    name,
    project: conversation?.project || conversation?.projectTitle || conversation?.subject || 'Project',
    price: conversation?.price || conversation?.budget || conversation?.amount || '',
    timeline: conversation?.timeline || conversation?.duration || conversation?.deadline || '',
    initials: conversation?.initials || getInitials(name),
    unread: Boolean(conversation?.unread ?? conversation?.hasUnread),
    tags: Array.isArray(conversation?.tags)
      ? conversation.tags
      : Array.isArray(conversation?.skills)
        ? conversation.skills
        : [],
  };
};

const normalizeMessage = (message, index) => {
  const direction = message?.type || message?.direction || message?.senderType;
  const isOutgoing =
    direction === 'outgoing' ||
    direction === 'sent' ||
    message?.isOutgoing === true ||
    message?.sender === 'freelancer';
  return {
    id: message?.id ?? message?.messageId ?? index + 1,
    conversationId: message?.conversationId ?? message?.threadId ?? message?.chatId ?? null,
    type: isOutgoing ? 'outgoing' : 'incoming',
    text: message?.text || message?.message || message?.body || '',
    time: message?.time || message?.timestamp || message?.sentAt || '',
  };
};

const demoConversations = [
  {
    id: 1,
    name: 'Client X',
    project: 'Custom Dashboard Panel',
    price: '$1500',
    timeline: '3 Weeks',
    initials: 'CX',
    unread: true,
    tags: ['JavaScript', 'Analytics', 'UI'],
  },
  {
    id: 2,
    name: 'Client A',
    project: 'Marketing Insights Portal',
    price: '$950',
    timeline: '2 Weeks',
    initials: 'CA',
    unread: false,
    tags: ['React', 'Charts'],
  },
  {
    id: 3,
    name: 'Client B',
    project: 'E-commerce KPI Audit',
    price: '$1200',
    timeline: '4 Weeks',
    initials: 'CB',
    unread: false,
    tags: ['Data', 'UX'],
  },
];

const demoMessages = [
  {
    id: 1,
    conversationId: 1,
    type: 'incoming',
    text: 'Hi Akash, just checking on the latest dashboard iteration.',
    time: '09:12',
  },
  {
    id: 2,
    conversationId: 1,
    type: 'outgoing',
    text: 'Shared the updated layout. I can walk you through the data flow if needed.',
    time: '09:18',
  },
  {
    id: 3,
    conversationId: 1,
    type: 'incoming',
    text: 'Looks great. Can we highlight the revenue cards more?',
    time: '09:26',
  },
  {
    id: 4,
    conversationId: 1,
    type: 'outgoing',
    text: 'Absolutely. I will add a stronger accent and send a preview today.',
    time: '09:31',
  },
  {
    id: 5,
    conversationId: 2,
    type: 'incoming',
    text: 'Can we align the insights page to the new branding?',
    time: 'Yesterday',
  },
  {
    id: 6,
    conversationId: 2,
    type: 'outgoing',
    text: 'Yes, I will update the colors and typography today.',
    time: 'Yesterday',
  },
  {
    id: 7,
    conversationId: 3,
    type: 'incoming',
    text: 'Do we have the weekly KPI summary ready?',
    time: 'Mon',
  },
  {
    id: 8,
    conversationId: 3,
    type: 'outgoing',
    text: 'Draft is ready. Sending for review in an hour.',
    time: 'Mon',
  },
];

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
    const controller = new AbortController();

    const fetchMessages = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`${apiBase}/freelancer/messages`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to load messages');
        }

        const data = await response.json();
        const conversationList = Array.isArray(data?.conversations)
          ? data.conversations.map(normalizeConversation)
          : [];
        const messageList = Array.isArray(data?.messages)
          ? data.messages.map(normalizeMessage)
          : [];

        setConversations(conversationList);
        setMessages(messageList);

        const initialActive = data?.activeConversationId ?? conversationList[0]?.id ?? null;
        setActiveConversationId(initialActive);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('');
          setConversations(demoConversations.map(normalizeConversation));
          setMessages(demoMessages.map(normalizeMessage));
          setActiveConversationId(demoConversations[0]?.id ?? null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    return () => controller.abort();
  }, []);

  const filteredConversations = useMemo(() => {
    if (!searchTerm) {
      return conversations;
    }
    const term = searchTerm.toLowerCase();
    return conversations.filter((conversation) =>
      `${conversation.name} ${conversation.project}`.toLowerCase().includes(term)
    );
  }, [conversations, searchTerm]);

  const activeConversation = useMemo(() => {
    if (!conversations.length) {
      return null;
    }
    return (
      conversations.find((conversation) => conversation.id === activeConversationId) ||
      conversations[0]
    );
  }, [conversations, activeConversationId]);

  const activeMessages = useMemo(() => {
    if (!messages.length) {
      return [];
    }
    const hasConversationId = messages.some((message) => message.conversationId != null);
    if (!hasConversationId || !activeConversation?.id) {
      return messages;
    }
    return messages.filter((message) => message.conversationId === activeConversation.id);
  }, [messages, activeConversation]);

  return (
    <div className="messages-page">
      <div className="messages-shell">
        <div className="messages-sidebar">
          <div className="messages-sidebar__header">
            <div>
              <h2>Messages</h2>
              <p>Active conversations</p>
            </div>
            <button className="icon-button" type="button" aria-label="Create new message">
              +
            </button>
          </div>

          <div className="messages-search">
            <input
              type="search"
              placeholder="Search Contacts..."
              aria-label="Search contacts"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="messages-list">
            {isLoading ? <p className="messages-empty">Loading conversations...</p> : null}
            {!isLoading && error ? <p className="messages-empty">{error}</p> : null}
            {!isLoading && !error && filteredConversations.length === 0 ? (
              <p className="messages-empty">No conversations found.</p>
            ) : null}
            {!isLoading &&
              !error &&
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  className={
                    conversation.id === activeConversation?.id
                      ? 'messages-card messages-card--active'
                      : 'messages-card'
                  }
                  onClick={() => setActiveConversationId(conversation.id)}
                >
                  <div className="messages-avatar">{conversation.initials}</div>
                  <div className="messages-card__body">
                    <div className="messages-card__title">
                      <span>{conversation.name}</span>
                      {conversation.unread ? <span className="messages-dot" /> : null}
                    </div>
                    <p>{conversation.project}</p>
                    <div className="messages-card__meta">
                      <span className="price">{conversation.price}</span>
                      <span className="divider" />
                      <span>{conversation.timeline}</span>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>

        <div className="messages-chat">
          {activeConversation ? (
            <>
              <div className="messages-chat__header">
                <div className="chat-identity">
                  <div className="chat-avatar">{activeConversation.initials}</div>
                  <div>
                    <h3>{activeConversation.name}</h3>
                    <p>{activeConversation.project}</p>
                  </div>
                </div>
                <div className="chat-tags">
                  {activeConversation.price ? <span>{activeConversation.price}</span> : null}
                  {activeConversation.timeline ? <span>{activeConversation.timeline}</span> : null}
                  {(activeConversation.tags || []).slice(0, 3).map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="messages-chat__body">
                {isLoading ? <p className="messages-empty">Loading messages...</p> : null}
                {!isLoading && error ? <p className="messages-empty">{error}</p> : null}
                {!isLoading && !error && activeMessages.length === 0 ? (
                  <p className="messages-empty">No messages yet.</p>
                ) : null}
                {!isLoading &&
                  !error &&
                  activeMessages.map((message) => (
                    <div
                      key={message.id}
                      className={
                        message.type === 'outgoing'
                          ? 'message-row message-row--outgoing'
                          : 'message-row'
                      }
                    >
                      {message.type === 'incoming' ? <span className="message-avatar" /> : null}
                      <div className="message-bubble">
                        <p>{message.text}</p>
                        <span>{message.time}</span>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="messages-chat__input">
                <div className="input-shell">
                  <input type="text" placeholder="Type here..." aria-label="Message input" />
                  <button className="icon-button" type="button" aria-label="Attach file">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path
                        d="M14.5 6.5L8 13a3 3 0 104.2 4.2l6.9-6.9a5 5 0 10-7.1-7.1L4.5 10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button className="send-button" type="button" aria-label="Send message">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M5 12l14-7-4 14-3-6-7-1z" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="messages-empty-state">
              <p className="messages-empty">
                {isLoading ? 'Loading messages...' : 'Select a conversation to start messaging.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
