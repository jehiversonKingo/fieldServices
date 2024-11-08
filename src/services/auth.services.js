import { axiosInstance, customHeadersWithoutAuth } from '../functions/fncAxios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setTokenUser } from './settings.services';

export const getUserByUid = async (uid) => {
    try {
        console.log("HEEEE", uid);
        return await axiosInstance
            .get(`/settings/user/${uid}`)
            .then(async user => {
                console.log('{SUCESS}', user.data);
                if (user.data !== null) {
                    await AsyncStorage.setItem('@session', 'true');
                    await AsyncStorage.setItem('@user', JSON.stringify(user.data));
                    return { error: false, message: '' };
                } else {
                    return { error: true, message: 'Usuario no encontrado' };
                }
            })
            .catch(error => {
                console.log("???1???", error)
                return { error: true, message: error.message };
            });
    } catch (error) {
        console.log("???2???")
        return { error: true, message: error.message };
    }
};

export const getUserByRole = async (role, idUser) => {
    return axiosInstance
        .get(`settings/user/${idUser}/role/${role}`, customHeadersWithoutAuth)
        .then(users => {
            let agents = [];
            users.data.map((user) => {
                agents.push({ label: `${user.name} ${user.lastName}`, value: user.idUser });
            });
            return agents;
        })
        .catch(() => {
            return [];
        });
};

export const getUserById = async (idUser) => {
    console.log(idUser);
    return axiosInstance
        .get(`settings/user/data/${idUser}`, customHeadersWithoutAuth)
        .then(resp => {
            return resp.data;
        })
        .catch(() => {
            return [];
        });
};