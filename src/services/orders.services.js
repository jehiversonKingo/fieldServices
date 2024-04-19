import {axiosInstance, customHeadersAuth} from '../functions/fncAxios';
import {handleUpdateImage} from '../functions/fncFirebase';
import {handleIsValidUrl, handleGetDataUserLocal} from '../functions/fncGeneral';

export const getOrders = async () => {
  const {idWarehouse} = await handleGetDataUserLocal();
    const headers = await customHeadersAuth();
    return axiosInstance
    .get(`/order/listByUser/${idWarehouse}`, headers)
    .then(order => {
      return order.data;
    })
    .catch(() => {
      return [];
    });
};

export const getOrder = async (idOrder) => {
  const headers = await customHeadersAuth();
    return axiosInstance
    .get(`/order/getOrder/${idOrder}`, headers)
    .then(order => {
      const {data} = order.data;
      return {status: true, data: data};
    })
    .catch(error => {
      const {response} = error;
      return {status:false, message: response.data.message};
    });
};

export const setDataAllOrder = async (data) => {
  const headers = await customHeadersAuth();
  const {idWarehouse} = await handleGetDataUserLocal();
  const {step1, step2, step3} = data;

  // let urlsPhotos = [];
  // let url = '';
  // await Promise.all(
  //   step3.map(async (photo) => {
  //       if (handleIsValidUrl(photo) === false) {
  //         url = await handleUpdateImage(Math.random(), 'orders', photo.photo);
  //       } else {
  //         url = photo;
  //       }

  //       urlsPhotos.push({url});
  //     })
  //   );
    return await axiosInstance
      .post('/order/setOrder', {
          received:step1[0].value,
          step2,
          // photos:urlsPhotos,
          sender:idWarehouse,
        }, headers)
      .then(task => {
        const {title, message, idOrder} = task.data;
        return {status: true, title, message, idOrder};
      })
      .catch(error => {
        console.log("ERROR ORDER", error)
        const {title, message} = error.response.data;
        return {status: false, message, title};
      });
};

export const setDataOrderPhotos = async (params) => {
  const headers = await customHeadersAuth();
  return await axiosInstance
    .post('/order/images', params, headers)
    .then(order => {
      console.log("[ RESPONSE UPLOAD ] => ", order);
      return order.data;
    })
    .catch(error => {
      console.log("[AXIOS ERROR UPLOAD ORDER ERRORS]>>", error);
      return error;
    });
}

export const getValidAddonOrEquipmentAsigned = async (addons) => {
  const headers = await customHeadersAuth();
    return await axiosInstance
    .post('/order/getValidAddonOrEquipmentAsigned', {addons}, headers)
    .then(addon => {
      return {status: true, message: addon.message, title: addon.title};
    })
    .catch(error => {
      const {data, title, message} = error.response.data;
      let customMessage = message;
      data.forEach((addon) => {
        customMessage = customMessage + '' + addon;
      });
      return {status: false, title, message:customMessage};
    });
};

export const deleteOrder = async (idOrder) => {
  const headers = await customHeadersAuth();
    return axiosInstance
    .delete(`/order/deleteOrder/${idOrder}`, headers)
    .then(order => {
      const {data} = order.data;
      return {status: true, data: data};
    })
    .catch(error => {
      const {response} = error;
      return {status:false, message: response.data.message};
    });
};

export const completeOrder = async (data) => {
  const headers = await customHeadersAuth();
  const {idWarehouse} = await handleGetDataUserLocal();
  const {step1, step2, idOrder} = data;
    return await axiosInstance
      .put('/order/complete', {
        idUserReceived: step1[0].value,
        idOrder,
        addons: step2,
        idWarehouseSender:idWarehouse,
      }, headers)
      .then(task => {
        const {title, message} = task.data;
        return {status: true, title, message};
      })
      .catch(error => {
        console.log(error)
        const {title, message} = error.response.data;
        return {status: false, message, title};
      });
};
