import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import api from "../utils/api";

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user }                            = useContext(AuthContext);
  const location                            = useLocation();
  const [notifications, setNotifications]   = useState([]);
  const [unreadCount, setUnreadCount]       = useState(0);
  const [msgUnreadCount, setMsgUnreadCount] = useState(0);
  const [toasts, setToasts]                 = useState([]);
  const wsRef                               = useRef(null);
  const toastTimers                         = useRef({});
  const onMessagesPage                      = useRef(false);

  // ── Sync onMessagesPage ref with actual current route ────
  // This fixes the case where user lands directly on /messages
  // or refreshes — the ref was always starting as false before.
  useEffect(() => {
    const isMessages = location.pathname === "/messages";
    onMessagesPage.current = isMessages;
    if (isMessages) {
      setMsgUnreadCount(0);
    }
  }, [location.pathname]);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/notifications/${user.id}`);
      setNotifications(res.data);
      const allUnread = res.data.filter(n => !n.is_read);
      setUnreadCount(allUnread.filter(n => n.type !== "message").length);
      // Only update msg count if NOT on messages page
      if (!onMessagesPage.current) {
        setMsgUnreadCount(allUnread.filter(n => n.type === "message").length);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err.message);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    loadNotifications();

    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }

    const ws = new WebSocket(`ws://localhost:8000/notifications/ws/${user.id}`);
    wsRef.current = ws;

    ws.onopen  = () => loadNotifications();
    ws.onerror = () => {};
    ws.onclose = () => {};

    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        setNotifications(prev => {
          if (prev.find(n => n.id === notification.id)) return prev;
          return [notification, ...prev];
        });
        if (notification.type === "message") {
          // Only increment badge if user is NOT currently on messages page
          if (!onMessagesPage.current) {
            setMsgUnreadCount(prev => prev + 1);
          }
        } else {
          setUnreadCount(prev => prev + 1);
        }
        showToast(notification);
      } catch (err) {
        console.error("Notification parse error:", err);
      }
    };

    return () => {
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
      Object.values(toastTimers.current).forEach(clearTimeout);
    };
  }, [user?.id]);

  const showToast = (notification) => {
    const toastId = `toast_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { ...notification, toastId }]);
    toastTimers.current[toastId] = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.toastId !== toastId));
      delete toastTimers.current[toastId];
    }, 5000);
  };

  const removeToast = (toastId) => {
    if (toastTimers.current[toastId]) {
      clearTimeout(toastTimers.current[toastId]);
      delete toastTimers.current[toastId];
    }
    setToasts(prev => prev.filter(t => t.toastId !== toastId));
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      const target = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
      if (target && !target.is_read) {
        if (target.type === "message") setMsgUnreadCount(prev => Math.max(0, prev - 1));
        else setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) { console.error("Failed to mark as read:", err.message); }
  };

  const markAllRead = async () => {
    if (!user?.id) return;
    try {
      await api.patch(`/notifications/${user.id}/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      setMsgUnreadCount(0);
    } catch (err) { console.error("Failed to mark all as read:", err.message); }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      const target = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (target && !target.is_read) {
        if (target.type === "message") setMsgUnreadCount(prev => Math.max(0, prev - 1));
        else setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) { console.error("Failed to delete notification:", err.message); }
  };

  // Called when user opens messages — clears badge and stops incrementing
  const enterMessages = () => {
    onMessagesPage.current = true;
    setMsgUnreadCount(0);
  };

  // Called when user leaves messages — re-enables badge incrementing
  const leaveMessages = () => {
    onMessagesPage.current = false;
  };

  // Backward compatibility
  const clearMessageCount = () => {
    onMessagesPage.current = true;
    setMsgUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      msgUnreadCount,
      toasts,
      markAsRead,
      markAllRead,
      deleteNotification,
      removeToast,
      loadNotifications,
      clearMessageCount,
      enterMessages,
      leaveMessages,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}