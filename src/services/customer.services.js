import {axiosInstance} from '../functions/fncAxios';

export const getTicketById = async () => {
  const headers = await customHeadersAuth();
  return await axiosInstance
    .post(`settings/plan/ticket/list`, headers)
    .then(ticket => {
      console.log(ticket.data);
      return ticket.data;
    })
    .catch(error => {
      console.log(error);
      return error;
    });
};
