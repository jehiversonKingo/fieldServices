import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// Check App Platform
const checkPlatform = () => {
  if (Platform.OS === 'android') {
    return 'android';
  } else {
    return 'ios';
  }
};

// Delete Async Storage Data
const deleteAsyncStorageData = async (key) => {
  await AsyncStorage.removeItem(key)
};

// Set Async Storage Data
const setAsyncStorageData = async (key, value) => {
  const stringData = JSON.stringify(value);
  await AsyncStorage.setItem(key, stringData);
};

// Get Async Storage Data
const getAsyncStorageData = async key => {
  const data = await AsyncStorage.getItem(key);
  return JSON.parse(data);
};

//Show Popup Alert
const showPopupWithOk = (title, message, okClicked) => {
  Alert.alert(title ? title : 'Doctory', message ? message : '', [
    {text: 'OK', onPress: () => okClicked && okClicked()},
  ]);
};

//Show Popup with ok and cancel
const showPopupWithOkAndCancel = (title, message, okClicked, cancelClicked) => {
  Alert.alert(title ? title : 'Doctory', message ? message : '', [
    {
      text: 'cancel',
      onPress: () => cancelClicked && cancelClicked(),
      style: 'cancel',
    },
    {
      text: 'ok',
      onPress: () => okClicked && okClicked(),
    },
  ]);
};

const handleFilterData = (dataForFilter, filter, type, attribute) => {
  let dataBack = [];
  console.log("[ PARAS ] >>>", filter);
  if (typeof filter === 'object') {
    dataBack = dataForFilter.filter(element => filter.includes(element[type][attribute]));
    dataForFilter.forEach(element => console.log(filter, element[type][attribute]));
  } else {
    dataBack = dataForFilter.filter(element => element[type][attribute] === filter);
  }
  console.log("[ dataBack ] >>>>>", dataBack)
  return dataBack;
};

const getApiGeolocalizacion = () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        resolve({ latitude, longitude });
      },
      error => {
        reject(error);
      },
      {enableHighAccuracy: true, timeout: 45000, maximumAge: 10000 }
    );
  });
};

const validateDPI = (value = '') => {
  if (!value) {
    return null;
  }

  const cuiRegExp = /^[0-9]{4}\s?[0-9]{5}\s?[0-9]{4}$/;

  if (!cuiRegExp.test(value)){
    return {message: 'El DPI no es válido'};
  }

  value = value.replace(/\s/, '');
  const depto = parseInt(value.substring(9, 11), 10);
  const muni = parseInt(value.substring(11, 13));
  const numero = value.substring(0, 8);
  const verificador = parseInt(value.substring(8, 9));

  const munisPorDepto = [
    /* 01 - Guatemala tiene:      */ 17,
    /* 02 - El Progreso tiene:    */ 8,
    /* 03 - Sacatepéquez tiene:   */ 16,
    /* 04 - Chimaltenango tiene:  */ 16,
    /* 05 - Escuintla tiene:      */ 13,
    /* 06 - Santa Rosa tiene:     */ 14,
    /* 07 - Sololá tiene:         */ 19,
    /* 08 - Totonicapán tiene:    */ 8,
    /* 09 - Quetzaltenango tiene: */ 24,
    /* 10 - Suchitepéquez tiene:  */ 21,
    /* 11 - Retalhuleu tiene:     */ 9,
    /* 12 - San Marcos tiene:     */ 30,
    /* 13 - Huehuetenango tiene:  */ 32,
    /* 14 - Quiché tiene:         */ 21,
    /* 15 - Baja Verapaz tiene:   */ 8,
    /* 16 - Alta Verapaz tiene:   */ 17,
    /* 17 - Petén tiene:          */ 14,
    /* 18 - Izabal tiene:         */ 5,
    /* 19 - Zacapa tiene:         */ 11,
    /* 20 - Chiquimula tiene:     */ 11,
    /* 21 - Jalapa tiene:         */ 7,
    /* 22 - Jutiapa tiene:        */ 17,
  ];

  if (depto === 0 || muni === 0) {
    return { message: 'DPI no es de Guatemala' };
  }

  if (depto > munisPorDepto.length) {
    return { message: 'Revise su DPI para ver si esta correcto' };
  }

  if (muni > munisPorDepto[depto - 1]) {
    return { message: 'Revise su DPI para ver si esta correcto' };
  }

  let total = 0;

  for (let i = 0; i < numero.length; i++) {
    total += numero[i] * (i + 2);
  }

  const modulo = total % 11;

  if (modulo !== verificador) {
    return { message: 'DPI inválido' };
  }

  return null;
};

const handleChange = (i, event, name, objData, setData) => {
  if (Array.isArray(objData)) {
    console.log('entro al if')
    const values = [...objData];
    values[i][name] = event?.value ? event.value : event;
    console.log(values)
    setData(() => values);
  } else if (typeof objData === 'object' && objData !== null) {
    console.log('entro al else');
    setData(() => event);
  }
};

const handleChangeArray = (i, event, objData, setData) => {
  setData(prevData => {
    const values = [...prevData];
    values[i] = event;
    return values;
  });
};

const handleAdd = (objData, setData, data) => {
  const values = [...objData];
  const {value, typeValue} = data;

  if (typeValue != null) {
    values.push({
      id: Math.random(),
      label: value,
      type: typeValue,
      value: '',
      isFocus: false,
      widthScreen: width,
    });

    setData(values);
  }
};

const handleRemove = (i, objData, setData, list = false) => {
  const values = [...objData];
  values.splice(i, 1);
  setData(values);
  return values;
};

const handleIsValidUrl = urlString => {
  var pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$',
    'i',
  ); // fragment locator
  console.log("handleIsValidUrl", !!pattern.test(urlString));
  return !!pattern.test(urlString);
};

const handleReverseStr = str => {
  let splitString = str.split('');
  let reverseArray = splitString.reverse();
  let joinArray = reverseArray.join('');
  return joinArray;
};

const handleCutString = (str, delimiter, reverse) => {
  let handleReverseString = str;
  if (reverse) {
    let first = handleReverseStr(handleReverseString);
    handleReverseString = first;
  }
  let newStr = handleReverseStr(handleReverseString.split(delimiter)[0]);
  return newStr;
};

const handleSplitLocation = (str) => {
  var expresionRegular = /\s*,\s*/;
  var listaNombres = str.split(expresionRegular);
  return listaNombres;
};

const groupEvidencesByTaskStep = (steps) => {
  console.log('', steps);
  return steps.reduce((acc, step) => {
    const { idTaskStep, TaskEvidences } = step;
    if (TaskEvidences.length > 0) {
      if (!acc[idTaskStep]) {
        acc[idTaskStep] = [];
      }
      acc[idTaskStep].push(...TaskEvidences);
    } else acc[idTaskStep] = [];
    return acc;
  }, {});
};

const addImagesToGroupedEvidences = (groupedEvidences, newImages) => {
  console.log("[ ---------------- ]", newImages);
  console.log("[ **************** ]", groupedEvidences);
  newImages.forEach(image => {
    const { idTaskStep } = image;
    if (!groupedEvidences[idTaskStep]) {
      groupedEvidences[idTaskStep] = [];
    }
    groupedEvidences[idTaskStep].push(image);
  });

  return groupedEvidences;
};


export {
  showPopupWithOk,
  showPopupWithOkAndCancel,
  getAsyncStorageData,
  setAsyncStorageData,
  deleteAsyncStorageData,
  checkPlatform,
  handleFilterData,
  getApiGeolocalizacion,
  validateDPI,
  handleChange,
  handleIsValidUrl,
  handleCutString,
  handleSplitLocation,
  handleChangeArray,
  handleAdd,
  handleRemove,
  groupEvidencesByTaskStep,
  addImagesToGroupedEvidences,
};
