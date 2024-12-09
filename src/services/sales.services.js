import { axiosInstance, customHeadersAuth } from '../functions/fncAxios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Manejo genérico de errores
const handleRequestError = (error, functionName) => {
  console.error(`[ ${functionName} ] Error:`, error.response?.data || error.message);
  return [];
};

// Obtener datos del cliente por ID
export const getDataCustomerById = async (idCustomer) => {
  try {
    const headers = await customHeadersAuth();
    const response = await axiosInstance.get(`/settings/customers/${idCustomer}`, headers);
    return response.data;
  } catch (error) {
    return handleRequestError(error, 'getDataCustomerById');
  }
};

// Crear un voucher
export const setVoucher = async (data) => {
  try {
    const user = JSON.parse(await AsyncStorage.getItem('@user'));
    const headers = await customHeadersAuth();
    const response = await axiosInstance.post(
      '/sales/voucher/user/create',
      { ...data, idUser: user.idUser },
      headers 
    );
    console.log('[ SET VOUCHER ] =>', response.data);
    return response.data;
  } catch (error) {
    return handleRequestError(error, 'setVoucher');
  }
};

// Obtener transacciones de un agente
export const getTransactionAgent = async () => {
  try {
    const headers = await customHeadersAuth();
    const user = JSON.parse(await AsyncStorage.getItem('@user'));
    const response = await axiosInstance.get(`/sales/transaction/user/list/${user.idUser}`, headers);
    return response.data;
  } catch (error) {
    return handleRequestError(error, 'getTransactionAgent');
  }
};

// Obtener deudas de un agente
export const getDebetAgent = async () => {
  try {
    const headers = await customHeadersAuth();
    const user = JSON.parse(await AsyncStorage.getItem('@user'));
    const response = await axiosInstance.get(`/sales/balance/debt/user/${user.idUser}`, headers);
    return response.data;
  } catch (error) {
    return handleRequestError(error, 'getDebetAgent');
  }
};

// Obtener billetera de un usuario
export const getWallerByUser = async () => {
  try {
    const headers = await customHeadersAuth();
    const user = JSON.parse(await AsyncStorage.getItem('@user'));
    const response = await axiosInstance.get(`/settings/wallet/user/${user.idUser}`, headers);
    console.log("[ GET WALLER BY USER ] =>", response.data);
    return response.data;
  } catch (error) {
    return handleRequestError(error, 'getWallerByUser');
  }
};

// Obtener billetera de un cliente
export const getWallerByCustomer = async (customerId) => {
  try {
    const headers = await customHeadersAuth();
    const response = await axiosInstance.get(`/settings/wallet/customer/${customerId}`, headers);
    return response.data;
  } catch (error) {
    return handleRequestError(error, 'getWallerByCustomer');
  }
};

// Obtener promociones
export const getAllPromotions = async () => {
  try {
    const headers = await customHeadersAuth();
    const response = await axiosInstance.get(`/sales/balance/customer/offline/promotion`, headers);
    return response.data;
  } catch (error) {
    return handleRequestError(error, 'getAllPromotions');
  }
};

// Obtener transacciones realizadas por un cliente
export const getTransactionCarriedOut = async (idCustomer) => {
  try {
    const headers = await customHeadersAuth();
    const response = await axiosInstance.get(`/sales/transaction/customer/list/${idCustomer}`, headers );
    return response.data;
  } catch (error) {
    return handleRequestError(error, 'getTransactionCarriedOut');
  }
};

// Obtener deuda de un cliente
export const getDebtCustomer = async (idCustomer) => {
  try {
    const headers = await customHeadersAuth();
    const response = await axiosInstance.get(`/sales/balance/debt/customer/${idCustomer}`, headers);
    return response.data;
  } catch (error) {
    return handleRequestError(error, 'getDebtCustomer');
  }
};

// Obtener balance de un cliente
export const getBalanceCustomer = async (idCustomer) => {
  try {
    const headers = await customHeadersAuth();
    const response = await axiosInstance.get(`/sales/balance/list/${idCustomer}`, headers);
    return response.data;
  } catch (error) {
    return handleRequestError(error, 'getBalanceCustomer');
  }
};

// Obtener ventas de un cliente
export const getSaleCustomer = async (idCustomer) => {
  try {
    const headers = await customHeadersAuth();
    const response = await axiosInstance.get(`/sales/code/generated/${idCustomer}`, headers);
    return response.data;
  } catch (error) {
    return handleRequestError(error, 'getSaleCustomer');
  }
};

// Obtener créditos de un cliente
export const getCreditsCustomer = async (idCustomer) => {
  try {
    const headers = await customHeadersAuth();
    const response = await axiosInstance.get(`/sales/credit/list/${idCustomer}`, headers);
    return response.data;
  } catch (error) {
    return handleRequestError(error, 'getCreditsCustomer');
  }
};
