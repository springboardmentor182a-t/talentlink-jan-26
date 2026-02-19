import { useState, useEffect, useCallback, useRef } from 'react';
import { messageAPI } from '../services/messages';

const POLL_INTERVAL = 3000; // 3 seconds

export const useMessages = (selectedUserId) => {
  const [conversations, setConversations]   = useState([]);
  const [messages, setMessages]             = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages]           = useState(false);
  const [error, setError]                   = useState(null);
  const pollRef                             = useRef(null);

  // ── Fetch conversations list ──────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const data = await messageAPI.getConversations();
      setConversations(data);
    } catch (err) {
      setError('Failed to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // ── Fetch messages for selected conversation ──────────────────────────────
  const fetchMessages = useCallback(async () => {
    if (!selectedUserId) return;
    try {
      const data = await messageAPI.getConversation(selectedUserId);
      setMessages(data);
    } catch (err) {
      setError('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  }, [selectedUserId]);

  // ── Send a message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (content) => {
    if (!selectedUserId || !content.trim()) return;
    try {
      await messageAPI.sendMessage(selectedUserId, content);
      await fetchMessages();       // Refresh immediately after sending
      await fetchConversations();  // Update last message in sidebar
    } catch (err) {
      setError('Failed to send message');
    }
  }, [selectedUserId, fetchMessages, fetchConversations]);

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ── Load messages when selected user changes ──────────────────────────────
  useEffect(() => {
    if (selectedUserId) {
      setLoadingMessages(true);
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedUserId, fetchMessages]);

  // ── Polling ───────────────────────────────────────────────────────────────
  useEffect(() => {
    pollRef.current = setInterval(() => {
      fetchConversations();
      if (selectedUserId) fetchMessages();
    }, POLL_INTERVAL);

    return () => clearInterval(pollRef.current);
  }, [fetchConversations, fetchMessages, selectedUserId]);

  return {
    conversations,
    messages,
    loadingConversations,
    loadingMessages,
    error,
    sendMessage,
    refetch: fetchConversations,
  };
};
