import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Image,
  NativeModules
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

//functions
import { handleIsValidUrl } from '../../../functions/fncGeneral';
import {Context as AuthContext} from '../../../context/AuthContext';
import PhotoManipulator from 'react-native-photo-manipulator';


const Header = ({ onClose, onTorchToggle, torchStatus, navigation }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onClose} hitSlop={{ top: 20, bottom: 20, left: 50, right: 50 }}>
      <Fontisto name="close-a" color={colorsTheme.gris20} size={20} style={styles.icon} />
    </TouchableOpacity>
    <View style={{ flexDirection:'row' }}>
          <TouchableOpacity
            style={{ 
              justifyContent:'center', 
              alignContent:'flex-end', 
              alignItems:'flex-end',  
              paddingHorizontal: 10,
              marginRight: 5
            }}
            onPress={() => onTorchToggle()}>
            <Ionicons
              name={torchStatus === "off" ? 'flash-off' : 'flash'}
              color={colorsTheme.blanco}
              size={30}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent:'center',
              paddingHorizontal: 8,
            }}
            onPress={() => {
              navigation.goBack();
            }}>
            <Ionicons name={'checkmark-circle-outline'} color={colorsTheme.blanco} size={32} />
          </TouchableOpacity>
          </View>
        </View>
);

const CaptureButton = ({ onPress }) => (
  <View style={styles.captureButtonContainer}>
    <TouchableOpacity style={styles.camExternalButton} onPress={onPress}>
      <View style={styles.camInternalButton} />
    </TouchableOpacity>
    <Text style={styles.captureButtonText}>Tocar para tomar fotos</Text>
  </View>
);

const { height, width } = Dimensions.get('screen');
const CameraMultiShotScreen = ({ navigation, route }) => {
  const { setData, data, idTaskStep } = route.params;
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
  const {GPSModule} = NativeModules;

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

    const handleGetFixLocation = () => {
      return new Promise((resolve, reject) => {
        GPSModule.getCurrentLocation((lat, lon) => {
          if (typeof lat === 'string' || typeof lon === 'string') {
            reject({latitude:0,longitude: 0});
            return;
          }
          const position = {latitude:lat,longitude: lon};
          resolve(position);
        });
      });
    };
  
    try {
      const response = await handleGetFixLocation();
      const { latitude, longitude } = response;
      const dateText = new Date().toLocaleString();
      const coordinateText = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;

      let watermarkText = [];
      await Image.getSize(`file://${photoPath}`,  (imageWidth, imageHeight) => {
        console.log('[ imageHeight ] >> ', imageHeight);
        watermarkText = [
          {
            text: `No.: ${idTaskStep.toString()}`,
            position: { x: imageWidth * 0.2, y: imageHeight - (imageHeight * 0.2) },
            textSize: Math.floor(imageWidth * 0.05),
            color: '#9B06CB',
          },
          {
            text: dateText,
            position: { x: imageWidth * 0.2, y: imageHeight - (imageHeight * 0.15) },
            textSize: Math.floor(imageWidth * 0.05),
            fontWeight: 700,
            color: '#9B06CB',
          },
          {
            text: coordinateText,
            position: { x: imageWidth * 0.2, y: imageHeight - (imageHeight * 0.1) },
            textSize: Math.floor(imageWidth * 0.05),
            fontWeight: 700,
            color: '#9B06CB',
          },
        ];
        return {width, height};
      });
      
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
    <SafeAreaView style={styles.safeArea}>
      <View>
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
              style={styles.camera}
              device={device}
              isActive={isScanned}
              photo={true}
              torch={torch}
            />
            <Header
              onClose={() => navigation.goBack()}
              onTorchToggle={() => setTorch(torch === 'off' ? 'on' : 'off')}
              torchStatus={torch}
              navigation={navigation}
            />
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
              <View style={{ marginTop: 10 }}>
                <CaptureButton onPress={onPressButton} />
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
  safeArea: { flex: 1, backgroundColor: colorsTheme.negro },
  camera: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  icon: { marginTop: 20 },
  captureButtonContainer: { alignItems: 'center', marginBottom: 30 },
  camExternalButton: {
    backgroundColor: colorsTheme.blanco,
    borderRadius: 50,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  camInternalButton: {
    backgroundColor: colorsTheme.naranja,
    borderRadius: 50,
    width: 60,
    height: 60,
  },
  captureButtonText: { color: colorsTheme.blanco, marginTop: 10 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  camButton: {
    flexDirection: 'row',
    backgroundColor: colorsTheme.naranja,
    borderRadius: 10,
    flex: 1,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  buttonText: {
    marginLeft: 10,
    color: colorsTheme.blanco,
    fontSize: 16,
  },
  container: {
    flex: 1,
  },
  image: {
    width: width,
    height: height,
    justifyContent: 'flex-end', 
  },
  overlay2: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
});

export default CameraMultiShotScreen;