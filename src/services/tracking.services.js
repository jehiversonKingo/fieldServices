import {axiosInstance, customHeadersAuth} from '../functions/fncAxios';

export const sendDataTracker = async (data) => {
  const headers = await customHeadersAuth();
  return await axiosInstance
    .post(`task/tracking/setTaskTracking`, data, headers)
    .then(ticket => {
      console.log(ticket.data);
      return ticket.data;
    })
    .catch(error => {
      console.log(error);
      return error;
    });
};
