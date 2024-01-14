import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useCameraDevices, Camera, useCameraDevice, useCameraFormat} from 'react-native-vision-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import {handleChange} from '../../../functions/functionChangeValue';
import FitImage from 'react-native-fit-image';

//Components
import Footer from '../../../components/Layouts/Footer';

import {colorsTheme} from '../../../configurations/configStyle';

const CameraScreen = ({navigation, route}) => {
  const {index, setData, data} = route.params;
  const {height, width} = Dimensions.get('screen');
  const [photoData, setPhotoData] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanned, setIsScanned] = useState(true);
  const [torch, setTorch] = useState("off");
  const device = useCameraDevice('back')
  const format = useCameraFormat(device, [
    {
      photoResolution: {
        width: 640,
        height: 480,
      },
      fps: 30
    }
  ])
  const camera = useRef(null);
console.log({index, setData, data})
  useEffect(() => {
    checkCameraPermission();
  }, [isScanned]);

  const checkCameraPermission = async () => {
    const status = await Camera.getCameraPermissionStatus();
    console.log("STATUS .............>", status);
    if (status !== 'granted') {
      Camera.requestCameraPermission()
    } else setHasPermission(true);
  };

  const handleClickBtnSuccess = async () => {
    setData(photoData)
    // handleChange(index, photoData, 'value', data, setData);
    navigation.goBack();
  };

  const handleClickBtnCancel = () => {
    setIsScanned(true);
    setPhotoData('');
  };

  const onPressButton = async () => {
    const photo = await camera.current.takePhoto({
      flash: torch,
      qualityPrioritization: 'balanced',
      jpeg: {
        quality: 0.5,
      },
    });
    setPhotoData(photo);
    setIsScanned(false);
  };

  return (
    <SafeAreaView style={{backgroundColor: colorsTheme.negro}}>
      <View>
        <View
          style={{
            marginTop: 20,
            width: '100%',
            height: 55,
            marginBottom: -45,
            flexDirection: 'row',
            justifyContent: "space-between"
          }}
        >
          <TouchableOpacity
            onPress={() => {navigation.goBack()}}
            hitSlop={{top: 20, bottom: 20, left: 50, right: 50}}
          >
            <Fontisto
              name={'close-a'}
              color={colorsTheme.gris20}
              size={20}
              style={{marginTop: 20, marginBottom: -40, marginLeft: 18}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginTop: 20, marginBottom: -35, marginRight: 18 }}
            onPress={() => setTorch((prevTorch) => prevTorch === "off" ? "on" : "off")}
            hitSlop={{top: 20, bottom: 20, left: 50, right: 50}}>
            <Ionicons
              name={torch === "off" ? 'flash' : 'flash-off'}
              color={colorsTheme.blanco}
              size={25}
            />
          </TouchableOpacity>
        </View>
        {isScanned === false && (
          <>
            <View>
              <View>
                <FitImage
                  indicator={true}
                  indicatorColor={colorsTheme.naranja}
                  indicatorSize="large"
                  source={{uri: 'file://' + photoData.path}}
                  style={{width: width, height: height * 0.8}}
                />
              </View>
              <View
                style={{marginTop: -height * 0.01, marginLeft: width * 0.22}}>
                <TouchableOpacity
                  style={styles.camCancelButton}
                  onPress={handleClickBtnCancel}>
                  <Ionicons name={'camera'} color={colorsTheme.blanco} size={25} />
                  <Text style={{marginLeft: 10}}>Volver a tomar</Text>
                </TouchableOpacity>
              </View>
              <View
                style={{marginTop: -height * 0.15, marginLeft: width * 0.22}}>
                <TouchableOpacity
                  style={styles.camConfirmationButton}
                  onPress={handleClickBtnSuccess}>
                  <Ionicons name={'save'} color={colorsTheme.blanco} size={25} />
                  <Text style={{marginLeft: 10}}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
        {isScanned === true && device != null && hasPermission && (
          <>
            <StatusBar barStyle="light-content" backgroundColor={colorsTheme.negro} />
            <Camera
              ref={camera}
              style={{marginTop: 50, height: height * 0.8, width: width}}
              device={device}
              isActive={isScanned}
              autoFocus="on"
              format={format}
              photo={true}
            />
            <View
              style={{
                alignContent: 'center',
                alignItems: 'center',
                marginTop: -height * 0.07,
              }}>
              <TouchableOpacity
                style={styles.camExternalButton}
                onPress={onPressButton}>
                <View style={styles.camInternalButton}/>
              </TouchableOpacity>
              <Text>Tocar para tomar fotos</Text>
            </View>
          </>
        )}
        <Footer styleCustomer={{marginTop: height}} />
      </View>
    </SafeAreaView>
  );
};

CameraScreen.navigationOptions = {
  header: () => false,
};

const styles = StyleSheet.create({
  camExternalButton: {
    marginBottom: 5,
    backgroundColor: colorsTheme.blanco,
    borderRadius: 50,
    width: 70,
    height: 70,
  },
  camInternalButton: {
    flexDirection: 'row',
    backgroundColor: colorsTheme.naranja,
    borderRadius: 100,
    width: 60,
    height: 60,
    margin: 5,
  },
  camConfirmationButton: {
    flexDirection: 'row',
    backgroundColor: colorsTheme.naranja,
    borderRadius: 10,
    width: 230,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    textAlign: 'center',
  },
  camCancelButton: {
    flexDirection: 'row',
    backgroundColor: colorsTheme.naranja,
    borderRadius: 10,
    width: 230,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    textAlign: 'center',
  },
});

export default CameraScreen;
