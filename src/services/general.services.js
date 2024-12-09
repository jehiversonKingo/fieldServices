import {axiosInstance} from '../functions/fncAxios';
import { customHeadersAuth} from '../functions/fncAxios';

export const setCollection = async (data) => {
  const headers = await customHeadersAuth();
  return await axiosInstance
    .post(`general/setCollection`, data, headers)
    .then(ticket => {
      console.log(ticket.data);
      return ticket.data;
    })
    .catch(error => {
      console.log(error);
      return error;
    });
};
