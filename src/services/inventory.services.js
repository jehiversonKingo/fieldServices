import {axiosInstance, customHeadersAuth} from '../functions/fncAxios';
import {handleGetDataUserLocal} from '../functions/fncGeneral';

export const getListAddon = async () => {
  const {idWarehouse} = await handleGetDataUserLocal();
    const headers = await customHeadersAuth();
    return axiosInstance
    .get(`/inventory/listAddon/${idWarehouse}`, headers)
    .then(inventory => {
      return inventory.data;
    })
    .catch(() => {
      return [];
    });
};

export const getListEquipment = async () => {
  const {idWarehouse} = await handleGetDataUserLocal();
    const headers = await customHeadersAuth();
    return axiosInstance
    .get(`/inventory/listEquipment/${idWarehouse}`, headers)
    .then(inventory => {
      return inventory.data;
    })
    .catch(() => {
      return [];
    });
};

