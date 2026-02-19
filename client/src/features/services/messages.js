import axios from '../../services/axios';

export const messageAPI = {

  // Send a message
  sendMessage: async (receiverId, content) => {
    const response = await axios.post('/messages/send', {
      receiver_id: receiverId,
      content,
    });
    return response.data;
  },

  // Get all conversations list
  getConversations: async () => {
    const response = await axios.get('/messages/conversations');
    return response.data;
  },

  // Get messages with a specific user
  getConversation: async (userId, skip = 0, limit = 50) => {
    const response = await axios.get(`/messages/conversations/${userId}`, {
      params: { skip, limit },
    });
    return response.data;
  },

  // Get unread messages count
  getUnreadCount: async () => {
    const response = await axios.get('/messages/unread-count');
    return response.data.unread_count;
  },

  // Get all users available to message
  getMessageableUsers: async () => {
    const response = await axios.get('/messages/users');
    return response.data;
  },
};
