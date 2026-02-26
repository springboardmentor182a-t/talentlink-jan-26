import axios from '../../services/axios';

export const messageAPI = {

  // ── WebSocket ticket ────────────────────────────────────────────────────
  // Exchange a valid session (Bearer token in axios interceptor) for a
  // short-lived one-time ticket used to authenticate the WS connection.
  // This keeps the JWT out of the WebSocket URL (and therefore out of logs).
  getWsTicket: async () => {
    const response = await axios.post('/messages/ws-ticket');
    return response.data.ticket;
  },

  // ── Messages ────────────────────────────────────────────────────────────
  sendMessage: async (receiverId, content) => {
    const response = await axios.post('/messages/send', {
      receiver_id: receiverId,
      content,
    });
    return response.data;
  },

  // ── Conversations ────────────────────────────────────────────────────────
  getConversations: async () => {
    const response = await axios.get('/messages/conversations');
    return response.data;
  },

  getConversation: async (userId, skip = 0, limit = 50) => {
    const response = await axios.get(`/messages/conversations/${userId}`, {
      params: { skip, limit },
    });
    return response.data;
  },

  // Explicit read receipt — called after messages are rendered on screen,
  // not as a side-effect of fetching them. Matches backend PATCH endpoint.
  markConversationRead: async (userId) => {
    await axios.patch(`/messages/conversations/${userId}/read`);
  },

  getUnreadCount: async () => {
    const response = await axios.get('/messages/unread-count');
    return response.data.unread_count;
  },

  // ── User search ─────────────────────────────────────────────────────────
  // Requires at least 2 characters — the backend enforces this too.
  // Returns an empty array immediately for short queries to avoid the
  // network call and the backend's 422 validation error.
  // TODO (tech debt): inconsistent error handling — short queries return []
  // silently, but network errors throw. The caller (NewConversation.jsx) must
  // wrap this in try/catch. Fix: pick one pattern and stick to it:
  //   Option A — always return [] (add: catch(e) { console.warn(e); return []; })
  //   Option B — always throw and handle in the component
  searchUsers: async (query, limit = 20, offset = 0) => {
    if (!query || query.trim().length < 2) return [];
    const response = await axios.get('/messages/users', {
      params: { q: query.trim(), limit, offset },
    });
    return response.data;
  },
};
