import {
  axiosInstance,
  axiosInstanceShopkeeper,
  customHeadersAuth
} from '../functions/fncAxios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getDataCustomerById = async (idCustomer) => {
  const headers = await customHeadersAuth();
  const response = await axiosInstance.get(`/settings/customers/${idCustomer}`, headers);
  return response.data
}

export const setVoucher = async (data) => {
  const user = JSON.parse(await AsyncStorage.getItem('@user'));
  const headers = await customHeadersAuth();
  const response = await axiosInstance
    .post(
      '/sales/voucher/user/create',
      { ...data, idUser: user.idUser }, headers)
  console.log("[ SET VOUCHER ] => ", response);
  return response.data
};

export const getTransactionAgent = async () => {
  const headers = await customHeadersAuth();
  const user = JSON.parse(await AsyncStorage.getItem('@user'));
  const response = await axiosInstance
    .get(`/sales/transaction/user/list/${user.idUser}`, headers)
  return response.data
};

export const getDebetAgent = async () => {
  const headers = await customHeadersAuth();
  const user = JSON.parse(await AsyncStorage.getItem('@user'));
  const response = await axiosInstance
    .get(`/sales/balance/debt/user/${user.idUser}`, headers)
  return response.data
}

export const getWallerByUser = async () => {
  const headers = await customHeadersAuth();
  const user = JSON.parse(await AsyncStorage.getItem('@user'));
  const response = await axiosInstance
    .get(`/settings/wallet/user/${user.idUser}`, headers)
  return response.data
}

export const getWallerByCustomer = async (customerId) => {
  try {
    const response = await axiosInstanceShopkeeper.get(`/settings/wallet/customer/${customerId}`)
    return response.data
  } catch (error) {
    console.log('[ getWallerByCustomer ] ', error)
    return [];
  }
}

export const getAllPromotions = async () => {
  return await axiosInstanceShopkeeper
    .get(`/sales/balance/customer/offline/promotion`)
    .then(promotions => {
      return promotions.data;
    })
    .catch(error => {
      console.log(error);
      return error;
    });
};

export const getTransactionCarriedOut = async(idCustomer) => {
  try{
    const response = await axiosInstanceShopkeeper.get(`/sales/transaction/customer/list/${idCustomer}`);
    return response.data;
  }catch(error){
    console.error('[ getTransactionCarriedOut ]', error);
    return [];
  }
}

export const getDebtCustomer = async(idCustomer) => {
  try{
    const datos = await axiosInstanceShopkeeper.get(`/sales/balance/debt/customer/${idCustomer}`);
    return datos.data;
  }catch(error){
    console.error('[ getDebtCustomer ]', error);
    return [];
  }
}

export const getBalanceCustomer = async(idCustomer) => {
  try{
    const datos = await axiosInstanceShopkeeper.get(`/sales/balance/list/${idCustomer}`);
    return datos.data;
  }catch(error){
    console.error('[ getBalanceCustomer ]', error);
    return [];
  }
}

export const getSaleCustomer = async(idCustomer) => {
  try{
    const datos = await axiosInstanceShopkeeper.get(`/sales/code/generated/${idCustomer}`);
    return datos.data;
  } catch (error) {
    const { data } = error.response;
      console.log("[AXIOS ERROR]>>", data);
    return [];
  }
}

export const getCreditsCustomer = async(idCustomer) => {
  try{
    const headers = await customHeadersAuth();
    const response = await axiosInstance
      .get(`/sales/credit/list/${idCustomer}`, headers)
    return response.data
  } catch(error) {
    console.error('[ getCreditsCustomer ]', error);
    return [];
  }
}