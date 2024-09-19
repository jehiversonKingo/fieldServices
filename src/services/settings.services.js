import {axiosInstance, axiosInstanceShopkeeper, customHeadersAuth} from '../functions/fncAxios';

export const setTokenUser = async (user, token) => {
    return axiosInstance
        .get(`settings/user/pushToken/${user.idUser}/${token}/App`, customHeadersAuth)
        .then(token => {
            return token;
        })
        .catch((e) => {
            console.log("[ ERROR setTokenUser ]", e)
            return [];
        });
  };

export const getModulesByRole = async (role) => {
    const headers = await customHeadersAuth();
    return axiosInstance
        .get(`settings/module/list/${role}/1`, headers)
        .then(response => {
            return response.data
        })
        .catch((e) => {
            console.log("[ ERROR getModulesByRole ]", e);
            return e;
        })
}

export const getAllCommunities = async () => {
    const headers = await customHeadersAuth();
    return axiosInstance
        .get(`settings/community/list`, headers)
        .then(response => {
            return response.data
        })
        .catch((e) => {
            console.log("[ ERROR getAllCommunities ]", e);
            return e;
        })
}

export const getAllBanks = async () => {
    const headers = await customHeadersAuth();
    return axiosInstance
        .get(`settings/bank/list`, headers)
        .then(response => {
            return response.data
        })
        .catch((e) => {
            console.log("[ ERROR getAllBanks ]", e);
            return e;
        })
}

export const getAllRules = async () => {
    return axiosInstanceShopkeeper
        .get(`settings/rule/list`)
        .then(response => {
            return response.data
        })
        .catch((e) => {
            console.log("[ ERROR getAllBanks ]", e);
            return e;
        })
}

export const getAllPlans = async () => {
    return axiosInstanceShopkeeper
        .get(`settings/plan/ticket/list`)
        .then(response => {
            return response.data
        })
        .catch((e) => {
            console.log("[ ERROR getAllBanks ]", e);
            return e;
        })
}

export const getCurrency = async () => {
    const headers = await customHeadersAuth();
    return axiosInstance
        .get(`settings/currency/1`, headers)
        .then(response => {
            return response.data
        })
        .catch((e) => {
            console.log("[ ERROR getAllBanks ]", e);
            return e;
        })
}