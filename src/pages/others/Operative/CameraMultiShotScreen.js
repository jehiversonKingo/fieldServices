import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import { handleRemove } from '../../../functions/functionChangeValue';
import FitImage from 'react-native-fit-image';
import * as RNFS from 'react-native-fs';
//Components
import Footer from '../../../components/Layouts/Footer';
import { FlatList } from 'react-native-gesture-handler';
import { colorsTheme } from '../../../configurations/configStyle';
import { handleGetLocationValue} from '../../../functions/fncLocation';

//functions
import { handleIsValidUrl } from '../../../functions/fncGeneral';
import {Context as AuthContext} from '../../../context/AuthContext';
import PhotoManipulator from 'react-native-photo-manipulator';

const CameraMultiShotScreen = ({ navigation, route }) => {
  const { setData, data, idTaskStep } = route.params;
  const { height, width } = Dimensions.get('screen');
  const device = useCameraDevice('back');
  const [photoData, setPhotoData] = useState('');
  const [indexUse, setIndexUse] = useState(0);
  const [photos, setPhotos] = useState(data);
  const [photosBase64, setPhotosBase64] = useState(data);
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanned, setIsScanned] = useState(true);
  const [torch, setTorch] = useState("off");
  const camera = useRef(null);

  const {state} = useContext(AuthContext);
  const {inline} = state;

  useEffect(() => {
    checkCameraPermission();
    console.log("[DATA] >>", setData, data);

    // setData((prev) => [...prev, ...photosBase64]);
  }, [isScanned]);

  const checkCameraPermission = async () => {
    const status = await Camera.getCameraPermissionStatus();
    setHasPermission(status === 'granted');
  };

  const handleClickBtnDelete = async () => {
    handleRemove(indexUse, photos, setPhotos);
    handleRemove(indexUse, photosBase64, setPhotosBase64);
    setIsScanned(true);
  };

  const handleClickBtnCancel = () => {
    setIsScanned(true);
  };

  const handleShowImage = (item, index) => {
    setPhotoData(item);
    setIndexUse(index);
    setIsScanned(false);
  };
  
  const addWatermark = async (photoPath) => {
    if (!photoPath) {
      console.error("[ERROR] photoPath is undefined or null");
      return null;
    }
  
    try {
      const response = await handleGetLocationValue();
      const { latitude, longitude } = response;
      const dateText = new Date().toLocaleString();
      const coordinateText = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
  
      const watermarkText = [
        {
          text: `No.: ${idTaskStep.toString()}`,
          position: { x: 2560, y: 3600 },
          textSize: 100,
          color: '#ed6a2c',
        },
        {
          text: dateText,
          position: { x: 1910, y: 3800 },
          textSize: 100,
          color: '#ed6a2c',
        },
        {
          text: coordinateText,
          position: { x: 1540, y: 4000 },
          textSize: 100,
          color: '#ed6a2c',
        }
      ];
      
      const resultPath = await PhotoManipulator.printText(`file://${photoPath}`, watermarkText);
  
      if (!resultPath) {
        console.error("[ERROR]");
        return null;
      }
  
      return resultPath;
    } catch (error) {
      console.error('[ERROR addWatermark] >>', error);
      return null;
    }
  };
  
  const onPressButton = async () => {
    try {
      const photo = await camera.current.takePhoto({
        flash: torch,
        qualityPrioritization: 'speed',
        enableShutterSound: false,
        resolution: {
          width: 640,
          height: 480,
        },
        jpeg: {
          quality: 50,
        },
      });
  
      if (!photo || !photo.path) {
        console.error("[ERROR] Failed to take photo or path is undefined");
        return;
      }
  
      const photoWithWatermark = await addWatermark(photo.path);
  
      if (!photoWithWatermark) {
        console.error("[ERROR] Failed to add watermark");
        return;
      }
  
      console.log('[IMG WATERMARK] >', photoWithWatermark);
  
      const base64 = await RNFS.readFile(photoWithWatermark, 'base64');
  
      let newValue = [...photos, { photo, idTaskStep, path: photoWithWatermark }];
      let newValue2 = [...photosBase64, { photo: `data:image/jpg;base64,${base64}`, idTaskStep, path: photoWithWatermark }];
  
      setPhotos(newValue);
      setPhotosBase64(newValue2);
      setData(inline ? newValue2 : newValue);
    } catch (error) {
      console.error('[ERROR onPressButton] >>', error);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: colorsTheme.negro }}>
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
            style={{ left: 0 }}
            onPress={() => {
              navigation.goBack();
            }}>
            <Fontisto
              name={'close-a'}
              color={colorsTheme.gris20}
              size={20}
              style={{ marginTop: 20, marginBottom: -40, marginLeft: 18 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginTop: 15, marginBottom: -40, marginLeft: 18 }}
            onPress={() => setTorch((prevTorch) => prevTorch === "off" ? "on" : "off")}>
            <Ionicons
              name={torch === "off" ? 'flash' : 'flash-off'}
              color={colorsTheme.blanco}
              size={25}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginTop: 10,
              flexDirection: 'row',
              backgroundColor: colorsTheme.naranja,
              borderRadius: 10,
              width: 100,
              height: 40,
              // position: 'absolute',
              right: 5,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => {
              navigation.goBack();
            }}>
            <Ionicons name={'checkmark-circle-outline'} color={colorsTheme.blanco} size={25} />
            <Text style={{}}>Completar</Text>
          </TouchableOpacity>
        </View>

        {isScanned === false && (
          <>
            <View>
              <View style={{ justifyContent: 'center' }}>
                <FitImage
                  indicator={true}
                  indicatorColor={colorsTheme.naranja}
                  indicatorSize="large"
                  source={{
                    uri:
                      photoData !== '' || photoData.path !== '' ?
                        handleIsValidUrl(photoData) ?
                          photoData :
                          `file://${photoData.path}`
                        : 'https://via.placeholder.com/300',
                  }}
                  style={{ width: width, height: height }}
                  resizeMode="contain"
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: -height * 0.15,
                  marginHorizontal: width * 0.1,
                }}>
                <View>
                  <TouchableOpacity
                    style={styles.camCancelButton}
                    onPress={handleClickBtnCancel}>
                    <Ionicons name={'arrow-back'} color={colorsTheme.blanco} size={25} />
                    <Text style={{ marginLeft: 10 }}>Regresar</Text>
                  </TouchableOpacity>
                </View>
                <View>
                  <TouchableOpacity
                    style={styles.camConfirmationButton}
                    onPress={handleClickBtnDelete}>
                    <Ionicons name={'close-sharp'} color={colorsTheme.blanco} size={25} />
                    <Text style={{ marginLeft: 10 }}>Eliminar Foto</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}
        {isScanned === true && device != null && hasPermission && (
          <>
            <StatusBar barStyle="light-content" backgroundColor={colorsTheme.negro} />
            <Camera
              ref={camera}
              style={{ marginTop: 50, height: height * 0.8, width: width }}
              device={device}
              isActive={isScanned}
              autoFocus="on"
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
                <View style={styles.camInternalButton} />
              </TouchableOpacity>
              <Text>Tocar para tomar fotos</Text>
            </View>

            <View
              style={{ position: 'absolute', top: height * 0.68, width: width }}>
              <View style={{ alignContent: 'center', alignItems: 'center' }}>
                <FlatList
                  data={photos.filter(image => image.idTaskStep === idTaskStep)}
                  renderItem={({ item, index }) => {
                    return (
                      <TouchableOpacity
                        key={`get-photo-${photos.length + index}`}
                        style={{ width: 80, height: 80, margin: 2 }}
                        onPress={() => handleShowImage(item, index)}>
                        <FitImage
                          indicator={true}
                          indicatorColor={colorsTheme.naranja}
                          indicatorSize="large"
                          source={{
                            uri:
                              item !== '' ?
                                handleIsValidUrl(item) ?
                                  item :
                                  `file://${item.path || item.photo.path}`
                                : 'https://via.placeholder.com/300',
                          }}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    );
                  }}
                  keyExtractor={() => Math.random()}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  ListEmptyComponent={<Text>No se encontraron datos.</Text>}
                  horizontal={true}
                />
              </View>
            </View>
          </>
        )}
        <Footer styleCustomer={{ marginTop: height }} />
      </View>
    </SafeAreaView>
  );
};

CameraMultiShotScreen.navigationOptions = {
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
    backgroundColor: colorsTheme.rojo,
    borderRadius: 10,
    width: 150,
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
    width: 150,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    textAlign: 'center',
  },
});

export default CameraMultiShotScreen;