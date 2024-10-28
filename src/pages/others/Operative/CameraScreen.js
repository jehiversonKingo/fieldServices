import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Image,
  ImageBackground,
} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import PhotoManipulator from 'react-native-photo-manipulator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import FitImage from 'react-native-fit-image';
import * as RNFS from 'react-native-fs';
import Footer from '../../../components/Layouts/Footer';
import { colorsTheme } from '../../../configurations/configStyle';
import { handleGetLocationValue } from '../../../functions/fncLocation';
import { handleChange } from '../../../functions/functionChangeValue';

const { height, width } = Dimensions.get('screen');

const CameraScreen = ({ navigation, route }) => {
  const { index, setData, data = [] } = route.params;
  const [photoData, setPhotoData] = useState('');
  const [photoB64, setPhotoB64] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanned, setIsScanned] = useState(true);
  const [torch, setTorch] = useState('off');
  const device = useCameraDevice('back');
  const camera = useRef(null);

  useEffect(() => {
    checkCameraPermission();
  }, [isScanned]);

  const checkCameraPermission = async () => {
    const status = await Camera.getCameraPermissionStatus();
    if (status !== 'granted') {
      Camera.requestCameraPermission();
    } else {
      setHasPermission(true);
    }
  };

  const handleClickBtnSuccess = () => {
    if (Array.isArray(data) && typeof setData === 'function') {
      data[index] = { ...data[index], value: photoData };
      setData(photoB64);
    }
    navigation.goBack();
  };

  const handleClickBtnCancel = () => {
    setIsScanned(true);
    setPhotoData('');
  };

  const onPressButton = async () => {
    const response = await handleGetLocationValue();
    const { latitude, longitude } = response;
    const dateText = new Date().toLocaleString();
    const coordinateText = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;

    try {
      const photo = await camera.current.takePhoto({
        flash: torch,
        qualityPrioritization: 'speed',
        enableShutterSound: false,
        resolution: { width: 640, height: 480 },
        jpeg: { quality: 50 },
      });

      if (photo?.path) {
        const watermarkText = await createWatermarkText(photo.path, dateText, coordinateText);
        console.log('[watermarkText]', watermarkText);
        console.log('[ PATH DATA ] >> ', photo.path)
        const resultPath = await PhotoManipulator.printText(`file://${photo.path}`, watermarkText);
        console.log('[ resultPath ] >> ', resultPath);
        const base64 = await RNFS.readFile(resultPath, 'base64');
        setPhotoData({ photo: resultPath, path: resultPath });
        setPhotoB64({ photo: `data:image/jpg;base64,${base64}`, path: resultPath });
        setIsScanned(false);
      }
    } catch (error) {
      console.error("Error al tomar la foto:", error);
    }
  };

  const createWatermarkText = async (imagePath, dateText, coordinateText) => {
    let watermarkText = [];
    await Image.getSize(`file://${imagePath}`, (imageWidth, imageHeight) => {
      console.log({imageWidth, imageHeight});
      watermarkText = [
        {
          text: dateText,
          position: { x: imageWidth * 0.15, y: imageHeight - (imageHeight * 0.15) },
          textSize: Math.floor(imageWidth * 0.05),
          color: '#ed6a2c',
        },
        {
          text: coordinateText,
          position: { x: imageWidth * 0.15, y: imageHeight - (imageHeight * 0.1) },
          textSize: Math.floor(imageWidth * 0.05),
          color: '#ed6a2c',
        },
      ];
    });
    return watermarkText;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colorsTheme.negro} />
      {isScanned === false ? (
        <ScannedView
          photoPath={photoData.path}
          onCancel={handleClickBtnCancel}
          onSave={handleClickBtnSuccess}
        />
      ) : (
        hasPermission && device && (
          <>
            <Camera
              ref={camera}
              style={styles.camera}
              device={device}
              isActive={isScanned}
              photo={true}
              autoFocus="on"
            />
            <View style={styles.overlay}>
              <Header
                onClose={() => navigation.goBack()}
                onTorchToggle={() => setTorch(torch === 'off' ? 'on' : 'off')}
                torchStatus={torch}
              />
              <CaptureButton onPress={onPressButton} />
            </View>
          </>
        )
      )}
      <Footer styleCustomer={{ marginTop: height }} />
    </SafeAreaView>
  );
};

const Header = ({ onClose, onTorchToggle, torchStatus }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onClose} hitSlop={{ top: 20, bottom: 20, left: 50, right: 50 }}>
      <Fontisto name="close-a" color={colorsTheme.gris20} size={20} style={styles.icon} />
    </TouchableOpacity>
    <TouchableOpacity onPress={onTorchToggle} hitSlop={{ top: 20, bottom: 20, left: 50, right: 50 }}>
      <Ionicons
        name={torchStatus === 'off' ? 'flash' : 'flash-off'}
        color={colorsTheme.blanco}
        size={25}
        style={styles.icon}
      />
    </TouchableOpacity>
  </View>
);

const ScannedView = ({ photoPath, onCancel, onSave }) => (
  <View style={styles.container}>
      <ImageBackground
        source={{ uri: 'file://' + photoPath }}
        style={styles.image}
        resizeMode="contain"
      >
        {/* Contenedor para los botones */}
        <View style={styles.overlay2}>
          <Button title="Volver a tomar" onPress={onCancel} />
          <Button title="Guardar" onPress={onSave} />
        </View>
      </ImageBackground>
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

const Button = ({ title, onPress }) => (
  <TouchableOpacity style={styles.camButton} onPress={onPress}>
    <Ionicons name={title === 'Guardar' ? 'save' : 'camera'} color={colorsTheme.blanco} size={25} />
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
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
    flex: 1, // Ocupa toda la pantalla
  },
  image: {
    width: width,  // 100% del ancho de la pantalla
    height: height, // 100% del alto de la pantalla
    justifyContent: 'flex-end', // Esto posiciona los botones en la parte inferior
  },
  overlay2: {
    position: 'absolute',
    bottom: 100, // Distancia del fondo
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribuye los botones horizontalmente
    paddingHorizontal: 20,
  },
});

export default CameraScreen;
