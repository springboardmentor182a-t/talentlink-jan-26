import { useState, useEffect, useCallback, useRef } from 'react';
import { messageAPI } from '../services/messages';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

// Polling is the fallback for environments where WS is unavailable
// (corporate proxies, some Safari versions on iOS, etc.)
const POLL_INTERVAL       = 5000;  // 5s
const WS_RECONNECT_DELAY  = 3000;  // base delay — multiplied by attempt count
const MAX_RECONNECT_TRIES = 5;

// Derive WS base URL from the existing Vite env var.
//   http://localhost:8000  →  ws://localhost:8000
//   https://api.example.com → wss://api.example.com
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const WS_BASE = API_URL
  .replace(/\/api$/, '')      // strip trailing /api
  .replace(/^http/, 'ws');    // http → ws, https → wss


// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useMessages
 *
 * Manages the full messaging state:
 *  - conversations list (sidebar)
 *  - messages in the active conversation
 *  - WebSocket connection for real-time delivery
 *  - polling fallback when WS is unavailable
 *  - online presence map { [userId]: boolean }
 *
 * @param {number|null} selectedUserId  - the partner's user ID
 * @param {object}      currentUser     - the logged-in user ({ id, ... })
 */
export const useMessages = (selectedUserId, currentUser) => {
  const [conversations, setConversations]               = useState([]);
  const [messages, setMessages]                         = useState([]);
  const [onlineUsers, setOnlineUsers]                   = useState({});
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages]           = useState(false);
  const [error, setError]                               = useState(null);
  const [wsConnected, setWsConnected]                   = useState(false);

  // Refs for WS/timers — closures in effects always see current values without
  // triggering re-renders and without stale-closure bugs.
  const wsRef             = useRef(null);
  const pollRef           = useRef(null);
  const reconnectTimer    = useRef(null);
  const reconnectCount    = useRef(0);
  const selectedUserIdRef = useRef(selectedUserId);
  const mountedRef        = useRef(true);

  // Separate ref for the ping interval so it can be cleared reliably on
  // reconnect — previously it lived on the socket object and leaked.
  const pingIntervalRef   = useRef(null);

  // Keep ref in sync with prop so the WS message handler can read it
  // without being re-created on every conversation switch.
  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);


  // ── Fetch conversations list ──────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const data = await messageAPI.getConversations();
      // MUST FIX (applied): error was set on failure but never cleared on recovery.
      // A transient network blip would leave the error banner visible indefinitely.
      if (mountedRef.current) {
        setError(null);
        setConversations(data);
      }
    } catch {
      if (mountedRef.current) setError('Failed to load conversations');
    } finally {
      if (mountedRef.current) setLoadingConversations(false);
    }
  }, []);


  // ── Fetch messages for the selected conversation ──────────────────────────
  const fetchMessages = useCallback(async () => {
    const uid = selectedUserIdRef.current;
    if (!uid) return;
    try {
      const data = await messageAPI.getConversation(uid);
      // MUST FIX (applied): same error-clearing fix as fetchConversations.
      if (mountedRef.current) {
        setError(null);
        setMessages(data);
      }
    } catch {
      if (mountedRef.current) setError('Failed to load messages');
    } finally {
      if (mountedRef.current) setLoadingMessages(false);
    }
  }, []);


  // ── Handle incoming WS messages ───────────────────────────────────────────
  const handleWsMessage = useCallback((event) => {
    let payload;
    try {
      payload = JSON.parse(event.data);
    } catch {
      return; // malformed frame — ignore
    }

    if (!mountedRef.current) return;

    switch (payload.type) {

      case 'new_message': {
        const msg = payload.message;
        const currentPartnerId = selectedUserIdRef.current;

        // Only append to the visible message list if this message belongs to
        // the currently open conversation.
        const isCurrentConversation =
          currentPartnerId &&
          (msg.sender_id === currentPartnerId || msg.receiver_id === currentPartnerId);

        if (isCurrentConversation) {
          setMessages(prev => {
            // Deduplication guard: the sender already appended optimistically
            // in sendMessage(). Prevent a double render by id check.
            const alreadyExists = prev.some(m => m.id === msg.id);
            return alreadyExists ? prev : [...prev, msg];
          });
        }

        // Always refresh conversations sidebar so last-message preview and
        // unread badge update regardless of which chat is open.
        fetchConversations();
        break;
      }

      case 'presence': {
        setOnlineUsers(prev => ({
          ...prev,
          [payload.user_id]: payload.status === 'online',
        }));
        break;
      }

      case 'online_users': {
        const map = {};
        (payload.user_ids || []).forEach(uid => { map[uid] = true; });
        setOnlineUsers(map);
        break;
      }

      default:
        break;
    }
  }, [fetchConversations]);


  // ── Polling helpers ───────────────────────────────────────────────────────
  const startPolling = useCallback(() => {
    if (pollRef.current) return; // already polling
    pollRef.current = setInterval(() => {
      fetchConversations();
      if (selectedUserIdRef.current) fetchMessages();
    }, POLL_INTERVAL);
  }, [fetchConversations, fetchMessages]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);


  // ── Clear the ping interval (extracted so connectWs can call it cleanly) ──
  const stopPing = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);


  // ── Connect WebSocket ─────────────────────────────────────────────────────
  const connectWs = useCallback(async () => {
    if (!currentUser?.id) return;

    // Step 1: Get a short-lived one-time ticket from the server.
    // This keeps the JWT out of the URL (and therefore out of server logs).
    let ticket;
    try {
      ticket = await messageAPI.getWsTicket();
    } catch {
      // If we can't get a ticket (e.g. network offline, session expired),
      // fall back to polling rather than leaving the user with no updates.
      console.warn('[WS] Could not get ticket — falling back to polling');
      startPolling();
      return;
    }

    // Step 2: Tear down any existing socket and its ping interval before
    // creating a new one. This is what was missing before — the old ping
    // interval leaked on every reconnect.
    stopPing();
    if (wsRef.current) {
      wsRef.current.onclose = null; // prevent onclose triggering another reconnect
      wsRef.current.close();
      wsRef.current = null;
    }

    // Step 3: Open the socket using the ticket, NOT the JWT.
    const url = `${WS_BASE}/ws/${currentUser.id}?ticket=${ticket}`;
    const ws  = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      reconnectCount.current = 0;
      setWsConnected(true);
      stopPolling(); // WS is live — polling not needed

      // Step 4: Start heartbeat ping. Stored in a ref so it can be cleared
      // reliably when connectWs is called again (reconnect or remount).
      pingIntervalRef.current = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send('ping');
        }
      }, 30_000);
    };

    ws.onmessage = handleWsMessage;

    ws.onerror = () => {
      // No-op: avoids unhandled error in console. Real handling happens onclose.
    };

    ws.onclose = (event) => {
      if (!mountedRef.current) return;

      // Always stop ping when the socket closes so we don't try to send
      // on a dead socket and don't leak the interval.
      stopPing();
      wsRef.current = null;
      setWsConnected(false);

      // 4001 = auth failure (invalid/expired ticket) — fall back to polling,
      // no reconnect (would just fail again until token is refreshed).
      // NOTE: this branch only works correctly because main.py was fixed to call
      // websocket.accept() before websocket.close(4001). Without that fix, Chrome
      // delivers close code 1006 (abnormal closure) here instead of 4001, and the
      // request falls through to the exponential-backoff reconnect below.
      if (event.code === 4001) {
        console.warn('[WS] Auth failed — ticket rejected. Falling back to polling.');
        startPolling();
        return;
      }

      // 4000 = this tab's socket was replaced by a second tab opening.
      // Start polling so this tab still gets updates via HTTP.
      if (event.code === 4000) {
        startPolling();
      }

      // Unexpected disconnect — exponential backoff reconnect.
      if (reconnectCount.current < MAX_RECONNECT_TRIES) {
        const delay = WS_RECONNECT_DELAY * (reconnectCount.current + 1);
        reconnectCount.current += 1;
        reconnectTimer.current = setTimeout(() => {
          if (mountedRef.current) connectWs();
        }, delay);
      } else {
        console.warn('[WS] Max reconnect attempts reached. Staying on polling.');
        startPolling();
      }
    };
  }, [currentUser?.id, handleWsMessage, startPolling, stopPolling, stopPing]);


  // ── Send a message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (content) => {
    const uid = selectedUserIdRef.current;
    if (!uid || !content.trim()) return;

    try {
      const saved = await messageAPI.sendMessage(uid, content);

      // Optimistic append so the UI is instant for the sender.
      // The WS broadcast from the server will also arrive (sender receives
      // their own push) but the deduplication guard above prevents a double.
      setMessages(prev => {
        const alreadyExists = prev.some(m => m.id === saved.id);
        return alreadyExists ? prev : [...prev, saved];
      });

      fetchConversations();
    } catch {
      setError('Failed to send message');
    }
  }, [fetchConversations]);


  // ── Mark conversation as read ─────────────────────────────────────────────
  // Called by Messages.jsx after the chat renders — not as a side-effect of
  // fetching messages. This matches the backend's explicit PATCH endpoint.
  const markRead = useCallback(async (userId) => {
    if (!userId) return;
    try {
      await messageAPI.markConversationRead(userId);
      // Refresh conversations to clear the unread badge in the sidebar.
      fetchConversations();
    } catch {
      // Non-fatal — unread badge may stay stale until next poll, that's fine.
    }
  }, [fetchConversations]);


  // ── Lifecycle — initial load + WS connect ─────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    fetchConversations();
    connectWs();

    return () => {
      mountedRef.current = false;
      stopPolling();
      stopPing();
      clearTimeout(reconnectTimer.current);

      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on intentional unmount
        wsRef.current.close();
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]); // re-run if the logged-in user changes


  // ── Load messages when selected conversation changes ──────────────────────
  useEffect(() => {
    if (selectedUserId) {
      setLoadingMessages(true);
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedUserId, fetchMessages]);


  return {
    conversations,
    messages,
    onlineUsers,
    loadingConversations,
    loadingMessages,
    error,
    wsConnected,
    sendMessage,
    markRead,
    refetch: fetchConversations,
  };
};
