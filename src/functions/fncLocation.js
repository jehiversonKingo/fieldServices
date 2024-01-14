import {Platform, PermissionsAndroid} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {handleChange} from './functionChangeValue';


const hasLocationPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version < 23) {
    return true;
  }

  const hasPermission = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  if (hasPermission) {
    return true;
  }

  const status = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  if (status === PermissionsAndroid.RESULTS.GRANTED) {
    return true;
  }

  if (status === PermissionsAndroid.RESULTS.DENIED) {
    ToastAndroid.show('Location permission denied by user.', ToastAndroid.LONG);
  } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    ToastAndroid.show(
      'Location permission revoked by user.',
      ToastAndroid.LONG,
    );
  }

  return false;
};

export const handleGetLocation = async (
  setInformation,
  objData,
  index,
  setIsAlert,
  setMessageAlert,
  setTitleAlert
) => {
  try {
    const hasPermission = await hasLocationPermission();
    if (!hasPermission) {
      return;
    }
    setIsAlert(true);
    setTitleAlert('Obteniendo ubicación');
    setMessageAlert('Espere un momento por favor...');
    Geolocation.getCurrentPosition(
      position => {
        handleChange(
          index,
          {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          'value',
          objData,
          setInformation,
        );
        setIsAlert(false);
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
        setIsAlert(false);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  } catch (error) {
    console.log("[ GET LOCATION ERROR ] > ", error);
  }
};

export const handleGetLocationReturnValue = async (
  setIsAlert,
  setMessageAlert,
  setTitleAlert
) => {
  const hasPermission = await hasLocationPermission();
  if (!hasPermission) {
    return;
  }
  setIsAlert(true);
  setTitleAlert('Obteniendo ubicación');
  setMessageAlert('Espere un momento por favor...');
  let locationTes = await new Promise((response, reject) =>{
    Geolocation.getCurrentPosition(
      position => {
        console.log("llegue", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        response({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      }, 
      error => {
        console.log(error.code, error.message);
        reject({error: error.code, message: error.message})
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  });
  console.log("Testing", locationTes)
  return locationTes;
};
