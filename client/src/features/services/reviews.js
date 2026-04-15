import axiosInstance from '../../services/axios';

const ReviewsService = {
  getForUser: (userId) => axiosInstance.get(`/reviews/user/${userId}`),
  create:     (data)   => axiosInstance.post('/reviews/', data),
};

export default ReviewsService;