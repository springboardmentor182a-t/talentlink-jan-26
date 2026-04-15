const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let message = "Request failed";
    try {
      const payload = await response.json();
      message = payload.detail || message;
    } catch (error) {
      message = response.statusText || message;
    }
    throw new Error(message);
  }
  return response.json();
};

export const fetchConversations = async () => {
  const response = await fetch(`${API_URL}/messages/conversations`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const fetchConversation = async (conversationId) => {
  const response = await fetch(`${API_URL}/messages/conversations/${conversationId}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const startConversation = async ({ proposalId, otherUserId }) => {
  const response = await fetch(`${API_URL}/messages/conversations/start`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      proposal_id: proposalId ?? null,
      other_user_id: otherUserId ?? null,
    }),
  });
  return handleResponse(response);
};

export const sendMessage = async (conversationId, content) => {
  const response = await fetch(
    `${API_URL}/messages/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    },
  );
  return handleResponse(response);
};
