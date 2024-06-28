import {axiosInstance, customHeadersAuth} from '../functions/fncAxios';
import {handleUpdateImage} from '../functions/fncFirebase';
import {handleGetDataUserLocal} from '../functions/fncGeneral';

export const getTicketById = async (idTicket) => {
  const headers = await customHeadersAuth();
  return await axiosInstance
    .get(`ticket/${idTicket}`, headers)
    .then(ticket => {
      console.log(ticket.data);
      return ticket.data;
    })
    .catch(error => {
      console.log(error);
      return error;
    });
};
