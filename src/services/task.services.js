import {axiosInstance, customHeadersAuth} from '../functions/fncAxios';
import {handleUpdateImage} from '../functions/fncFirebase';
import {handleGetDataUserLocal} from '../functions/fncGeneral';

export const getTasks = async () => {
  const {user} = await handleGetDataUserLocal();
  const headers = await customHeadersAuth();
  return await axiosInstance
    .post('/task/listByUser', {'uid': user.uid}, headers)
    .then(task => {
      console.log(task.data);
      return task.data;
    })
    .catch(error => {
      console.log(error);
      return error;
    });
};

export const getElemetScreen = async (id) => {
  const headers = await customHeadersAuth();
  return await axiosInstance
    .post('/task/elementScreen', {'idTask': id}, headers)
    .then(task => {
      return task.data;
    })
    .catch(error => {
      return error;
    });
};

export const getStepInstruction = async (idStep) => {
  const headers = await customHeadersAuth();
  return await axiosInstance
    .post('/task/stepInstruction', {'idStep': idStep}, headers)
    .then(task => {
      return task.data;
    })
    .catch(error => {
      return error;
    });
};

export const setDataAllTask = async (data) => {
  const headers = await customHeadersAuth();
  const {step1, step2, evidences, step4, idTask} = data;
  let urlsPhotos = [];
  await Promise.all(
      evidences.map(async (photo) => {
        let url = await handleUpdateImage(Math.random(), 'tasks', photo.photo);
        urlsPhotos.push({url, idTaskStep: photo.idTaskStep});
      })
    );

  return await axiosInstance
    .post('/task/progressTask', {
      step1,
      step2,
      step3:urlsPhotos,
      step4,
      idTask,
    }, headers)
    .then(task => {
      return task.data;
    })
    .catch(error => {
      console.log("[AXIOS ERROR]>>", error);
      return error;
    });
};

export const setCodeNoc = async (data) => {
  const headers = await customHeadersAuth();
  const {code, idTask} = data;

  return await axiosInstance
    .post('/task/completeTask', {code, idTask}, headers)
    .then(task => {
      return task.data;
    })
    .catch(error => {
      return error;
    });
};

export const getTaskById = async (id) => {
  const headers = await customHeadersAuth();

  return await axiosInstance
    .get(`/task/search/${id}`, headers)
    .then(task => {
      return task.data;
    })
    .catch(error => {
      return error;
    });
}
