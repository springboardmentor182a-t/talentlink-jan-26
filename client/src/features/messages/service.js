// Messages API service - connects to backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Get auth token from localStorage (set by auth team)
function getAuthToken() {
  return localStorage.getItem('auth_token') || '';
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`,
  };
}

/**
 * Fetch all conversations for the current user
 */
export async function getConversations() {
  try {
    const res = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch conversations: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
}

/**
 * Fetch messages for a specific conversation
 * @param {string} conversationId - The conversation ID
 */
export async function getMessages(conversationId) {
  try {
    const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

/**
 * Send a message in a conversation
 * @param {string} conversationId - The conversation ID
 * @param {string} text - The message text
 */
export async function sendMessage(conversationId, text) {
  try {
    const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`Failed to send message: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
}
