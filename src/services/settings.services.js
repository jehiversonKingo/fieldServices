import {axiosInstance, customHeadersAuth} from '../functions/fncAxios';

export const setTokenUser = async (user, token) => {
    const headers = await customHeadersAuth();
    return axiosInstance
        .get(`settings/user/pushToken/${user.idUser}/${token}/App`, headers)
        .then(token => {
            return token;
        })
        .catch((e) => {
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
            return e;
        })
}

export const getAllRules = async () => {
    const headers = await customHeadersAuth();
    return axiosInstance
        .get(`settings/rule/list`, headers)
        .then(response => {
            return response.data
        })
        .catch((e) => {
            return e;
        })
}

export const getAllPlans = async () => {
    const headers = await customHeadersAuth();
    return axiosInstance
        .get(`settings/plan/ticket/list`, headers)
        .then(response => {
            return response.data
        })
        .catch((e) => {
            return e;
        })
}

export const getCurrency = async () => {
    const headers = await customHeadersAuth();
    return axiosInstance
        .get(`settings/currency/${process.env.REACT_APP_CURRENCY}`, headers)
        .then(response => {
            return response.data
        })
        .catch((e) => {
            return e;
        })
}