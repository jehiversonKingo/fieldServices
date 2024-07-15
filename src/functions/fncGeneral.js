import { showMessage } from 'react-native-flash-message';
import notifee from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const handleIsValidUrl = urlString => {
  var pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$',
    'i',
  ); // fragment locator
  return !!pattern.test(urlString);
};

const handleReverseStr = str => {
  let splitString = str.split('');
  let reverseArray = splitString.reverse();
  let joinArray = reverseArray.join('');
  return joinArray;
};

export const handleCutString = (str, delimiter, reverse) => {
  let handleReverseString = str;
  if (reverse) {
    let first = handleReverseStr(handleReverseString);
    handleReverseString = first;
  }
  let newStr = handleReverseStr(handleReverseString.split(delimiter)[0]);
  return newStr;
};

export const handleSplitLocation = (str) => {
  var expresionRegular = /\s*,\s*/;
  var listaNombres = str.split(expresionRegular);
  return listaNombres;
};

export const handleTraslateMessageFirebaseError = message => {
  return new Promise((resolve, reject) => {
    switch (message) {
      case 'auth/claims-too-large':
        resolve(
          'La carga de reclamos proporcionada a setCustomUserClaims() supera el tamaño máximo permitido de 1000 bytes.',
        );
        break;
      case 'auth/email-already-exists':
        resolve(
          'El correo electrónico proporcionado ya está en uso por un usuario existente. Cada usuario debe tener un correo electrónico único.',
        );
        break;
      case 'auth/id-token-expired':
        resolve('El token de ID de Firebase proporcionado ha caducado.');
        break;
      case 'auth/id-token-revoked':
        resolve('Se revocó el token de ID de Firebase.');
        break;
      case 'auth/invalid-email':
        resolve(
          'El valor proporcionado para la propiedad de usuario de email no es válido. Debe ser una dirección de correo electrónico de cadena',
        );
        break;
      case 'auth/invalid-password':
        resolve(
          'El valor proporcionado para la propiedad de usuario de la password no es válido. Debe ser una cadena con al menos seis caracteres.',
        );
        break;
      case 'auth/user-not-found':
        resolve(
          'No existe un registro de usuario correspondiente al identificador proporcionado',
        );
        break;
      case 'auth/wrong-password':
        resolve('Contraseña proporcionada incorrecta para este usuario');
        break;
      case 'auth/too-many-requests':
        resolve(
          'Demasiados intentos con contraseñas incorrectas espere unos minutos para probar de nuevo',
        );
        break;
      case 'auth/network-request-failed':
        resolve('Error de red al intentar iniciar sesión');
        break;
      default:
        resolve('Error al intentar iniciar sesión');
        break;
    }
  });
};

export const handleValidDataStepTask = async (step) => {
  let isValid = true;
  if (step.length === 0) {
    isValid = false;
  } else {
    step.map(element => {
      if (element.value === '' || element.value === null) {
        isValid = false;
        return;
      }
    });
  }
  return isValid;
};

export const handleValidDataStep = async (step) => {
  let isValid = true;
  // if (step.length === 0) {
  //   isValid = false;
  // } else {
  //   step.map(element => {
  //     console.log(element.screenElement?.elementType.name, element.value);
  //     if (element.screenElement?.elementType.name === 'cellphone' && element.value.length < 12) {
  //       isValid = false;
  //       return;
  //     }

  //     if (element.value === '' || element.value === null || element.file === '') {
  //       isValid = false;
  //       return;
  //     }

  //     // if(element?.addon) {
  //     //   if (step.some(item => item.value === element.value)) {
  //     //     isValid = false;
  //     //     return;
  //     //   }
  //     // }

  //   });
  // }
  return isValid;
};

export const handleValidDataPhotos = (array1, array2) => {
  return array1.filter(object1 => {
    return !array2.some(object2 => {
      return object1.idTaskStep === object2.idTaskStep;
    });
  });
};

export const handleGPSCoordinates = (value) => {
  const coordinates = value;
  const expresion = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
  const sameCoordinates = coordinates.match(expresion);
  if (sameCoordinates) {
    const latitud = parseFloat(sameCoordinates[1]);
    const longitud = parseFloat(sameCoordinates[3]);
    console.log(`Latitud: ${latitud}, Longitud: ${longitud}`);
    return [latitud, longitud];
  } else {
    console.log("Formato de coordenadas no válido.");
    return [0, 0];
  }
};

export const handleValidateEmojiAndSpecialCharacter = (text) => {
  let flag = false;
  const regex = /[^\u0000-\u007F]+|[?!))$&.'!"@&]+/;
  const newValue = text;
  if (!regex.test(newValue)) {
    flag = true;
  }
  return flag;
};

export const handleValidExist = (value, lastValues, find, step) => {
  let refactorData = [...lastValues];
  value.forEach(element => {
    let exist = lastValues.findIndex(dataExist => dataExist[find] === element[find]);
    if (exist < 0) {
      refactorData.push(element);
    }
  });
  return refactorData;
};

export const handleFilterData = (dataForFilter, filter, setData, setLoading, type, attribute) => {
  let dataBack = [];
  if (type !== '') {
    dataBack = dataForFilter.filter(element => element[type][attribute] === filter);
  } else {
    dataBack = dataForFilter.filter(element => element[attribute] === filter);
  }
  setData(dataBack);
  setLoading(false);
};

export const handleCustomNotification = async () => {
  showMessage({
    message: 'Simple message',
    type: 'info',
  });
};

export const handleGetDataUserLocal = async () => {
  const dataUser = await AsyncStorage.getItem('@user');
  const { idWarehouse, user } = JSON.parse(dataUser);
  return ({ idWarehouse, user });
};

export const handleShowNotification = async ({ title, body }) => {
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId,
    },
  });
};

export const getDataUser = async () => JSON.parse(await AsyncStorage.getItem('@user'));

export const findInArray = (arr, key, value) => {
  return arr.find(object => object[key] === value);
} 

export const findIndexArray = (arr, key, value) => {
  return arr.findIndex(object => object[key] === value);
}
