import axiosInstance from '../../services/axios';

const ContractsService = {
  getAll:    ()           => axiosInstance.get('/contracts/'),
  getOne:    (id)         => axiosInstance.get(`/contracts/${id}`),
  create:    (data)       => axiosInstance.post('/contracts/', data),
  send:      (id)         => axiosInstance.post(`/contracts/${id}/send`),
  sign:      (id)         => axiosInstance.post(`/contracts/${id}/sign`),
  editTerms: (id, terms)  => axiosInstance.patch(`/contracts/${id}/terms`, { terms }),
  cancel:    (id)         => axiosInstance.post(`/contracts/${id}/cancel`),
  updateMilestone: (id, is_completed) =>
    axiosInstance.patch(`/contracts/milestones/${id}`, { is_completed }),
};

export default ContractsService;