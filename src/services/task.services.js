import {axiosInstance, customHeadersAuth} from '../functions/fncAxios';
import {handleUpdateImage} from '../functions/fncFirebase';
import {handleGetDataUserLocal} from '../functions/fncGeneral';

export const getTasks = async () => {
  const {user} = await handleGetDataUserLocal();
  const headers = await customHeadersAuth();
  return await axiosInstance
    .post('/task/listByUser', {'uid': user.uid}, headers)
    .then(task => {
      return task.data;
    })
    .catch(error => {
      console.log(error);
      const { data } = error.response;
      console.log("[AXIOS ERROR]>>", data);
      return data;
    });
};

export const getElemetScreen = async (id) => {
  const headers = await customHeadersAuth();
  return await axiosInstance
    .post('/task/elementScreen', {idTask: id}, headers)
    .then(task => {
      return task.data;
    })
    .catch(error => {
      const { data } = error.response;
      console.log("[AXIOS ERROR]>>", data);
      return data;
    });
};

export const getTaskStep = async (id) => {
  const headers = await customHeadersAuth();
  return await axiosInstance
    .get(`/task/${id}/step`, headers)
    .then(task => {
      return task.data;
    })
    .catch(error => {
      const { data } = error.response;
      console.log("[AXIOS ERROR]>>", data);
      return data;
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
      const { data } = error.response;
      console.log("[AXIOS ERROR]>>", data);
      return data;
    });
};

export const setDataAllTask = async (data) => {
  const headers = await customHeadersAuth();
  const {step1, step2, step4, idTask} = data;
  return await axiosInstance
    .post('/task/progressTask', {
      step1,
      step2,
      step4,
      idTask,
    }, headers)
    .then(task => {
      return task.data;
    })
    .catch(error => {
      const { data } = error.response;
      console.log("[AXIOS ERROR]>>", data);
      return data;
    });
};

export const setDataTaskChecklist = async (data) => {
  const headers = await customHeadersAuth();
  const {step5, idTask} = data;
  return await axiosInstance
    .post('/task/progressTask/checklist', {
      step5,
      idTask,
    }, headers)
    .then(task => {
      return task.data;
    })
    .catch(error => {
      const { data } = error.response;
      console.log("[AXIOS ERROR]>>", data);
      return data;
    });
};

export const setDataAllTaskInstall = async (data) => {
  const headers = await customHeadersAuth();
  const {step1, step2, step3, step4, idTask} = data;
  return await axiosInstance
    .post('/task/progressTask/install', {
      step1,
      step2,
      step3,
      step4,
      idTask,
    }, headers)
    .then(task => {
      return task.data;
    })
    .catch(error => {
      const { data } = error.response;
      console.log("[AXIOS ERROR]>>", data);
      return data;
    });
};

export const setDataAllTaskMaintenance = async (data) => {
  const headers = await customHeadersAuth();
  const {step1, step2, step3, step4, idTask} = data;
  return await axiosInstance
    .post('/task/progressTask/maintenance', {
      step1,
      step2,
      step3,
      step4,
      idTask,
    }, headers)
    .then(task => {
      return task.data;
    })
    .catch(error => {
      const { data } = error.response;
      console.log("[AXIOS ERROR]>>", data);
      return data;
    });
}

export const setDataAllTaskProspect = async (data) => {
  const headers = await customHeadersAuth();
  const {step1, step2, step3, step4, idTask} = data;
  return await axiosInstance
    .post('/task/progressTask/prospect', {
      step1,
      step2,
      step3,
      step4,
      idTask,
    }, headers)
    .then(task => {
      return task.data;
    })
    .catch(error => {
      const { data } = error.response;
      console.log("[AXIOS ERROR]>>", data);
      return data;
    });
}

export const setDataAllTaskSwap = async (data) => {
  const headers = await customHeadersAuth();
  const {step1, step2, step3, step4, idTask} = data;
  return await axiosInstance
    .post('/task/progressTask/swap', {
      step1,
      step2,
      step3,
      step4,
      idTask,
    }, headers)
    .then(task => {
      return task.data;
    })
    .catch(error => {
      const { data } = error.response;
      console.log("[AXIOS ERROR]>>", data);
      return data;
    });
};

export const setDataAllTaskMigration = async (data) => {
  const headers = await customHeadersAuth();
  // const {step1, step2, step3, step4, idTask} = data;
  return await axiosInstance
    .post('/task/progressTask/migration', data, headers)
    .then(task => {
      return task.data;
    })
    .catch(error => {
      const { data } = error.response;
      console.log("[AXIOS ERROR]>>", data);
      return data;
    });
};

export const setDataAllTaskPickup = async (data) => {
  const headers = await customHeadersAuth();
  const {step1, step2, step3, step4, idTask} = data;
  return await axiosInstance
    .post('/task/progressTask/pickup', {
      step1,
      step2,
      step3,
      step4,
      idTask,
    }, headers)
    .then(task => {
      return task.data;
    })
    .catch(error => {
      const { data } = error.response;
      console.log("[AXIOS PICKUP ERROR]>>", data);
      return data;
    });
};

export const setDataAllTaskVisit = async (data) => {
  const headers = await customHeadersAuth();
  return await axiosInstance
    .post('/task/progressTask/visit', data, headers)
    .then(task => {
      return task.data;
    })
    .catch(error => {
      const { data } = error.response;
      console.log("[AXIOS ERROR]>>", data);
      return data;
    });
};

export const setDataTaskEvidens = async (data) => {
  const {step3, idTask} = data;
  const headers = await customHeadersAuth();
  let urlsPhotos =  [];
  await Promise.all(
    step3.map(async (photo) => {
      let url = await handleUpdateImage(Math.random(), 'tasks', photo.photo);
      urlsPhotos.push({url, idTaskStep: photo.idTaskStep});
    })
  );

  return await axiosInstance
    .post('/task/progressTask/photos', {
      step3,
      idTask,
    }, headers)
    .then(task => {
      return task.data;
    })
    .catch(error => {
      const { data } = error.response;
      console.log("[AXIOS ERROR]>>", data);
      return data;
    });
}

export const setDataTaskPhotos = async (params) => {
  const headers = await customHeadersAuth();
  return await axiosInstance
    .post('/task/images', params, headers)
    .then(task => {
      // console.log("[ RESPONSE UPLOAD ] => ", task);
      return task.data;
    })
    .catch(error => {
      const { data } = error.response;
      console.log("[AXIOS ERROR]>>", data);
      return data;
    });
}

export const setCodeNoc = async (data) => {
  const headers = await customHeadersAuth();
  return await axiosInstance
    .post('/task/completeTask', data, headers)
    .then(task => {
      return task.data;
    })
    .catch(error => {
      const { data } = error.response;
      console.log("[AXIOS ERROR]>>", data);
      return data;
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
      const { data } = error.response;
      console.log("[AXIOS ERROR]>>", data);
      return data;
    });
}

export const getCheckListByIdTask = async (id) => {
  const headers = await customHeadersAuth();

  return await axiosInstance
    .get(`/check/taskCheck/list/${id}`, headers)
    .then(task => {
      return task.data;
    })
    .catch(error => {
      const { data } = error.response;
      console.log("[AXIOS ERROR]>>", data);
      return data;
    });
}