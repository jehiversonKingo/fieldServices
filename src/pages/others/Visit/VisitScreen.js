import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Dimensions, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';

// Components
import Header from '../../../components/Layouts/Header';
import { getTasks } from '../../../services/task.services';
import { handleGPSCoordinates } from "../../../functions/fncGeneral";
import { colorsTheme } from '../../../configurations/configStyle';
import AwesomeAlert from 'react-native-awesome-alerts';

const { height } = Dimensions.get('screen');

const VisitScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [checkpoints, setcheckpoints] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [titleAlert, setTitleAlert] = useState('');
  const [messageAlert, setMessageAlert] = useState('');

  const handleMarkerPress = (marker) => {
    setSelectedMarker(marker === selectedMarker ? null : marker);
  };

  const handleGetData = async () => {
    try {
      const checkpointsCustomer = [];
      const getTaskData = await getTasks();
      getTaskData.forEach(item => {
        const coordinates = handleGPSCoordinates(item.task.customer.gps);
        let color = "";
        switch (item.task.idTaskPriority) {
          case 1:
            color = colorsTheme.rojo;
            break;
          case 2:
            color = colorsTheme.amarillo;
            break;
          case 3:
            color = colorsTheme.verdeClaro;
            break;
        }
        checkpointsCustomer.push({
          idCustomer: item.task.customer.idCustomer,
          name: item.task.customer.name,
          dpi: item.task.customer.dpi,
          phone: item.task.customer.phone,
          community: item.task.customer.community,
          description: item.task.description,
          latitude: coordinates[0],
          longitude: coordinates[1],
          color
        });
      });

      setcheckpoints(checkpointsCustomer);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setTitleAlert('¡Atención!');
      setMessageAlert('No se pudo obtener la información. (CATCH ERROR)');
      setShowAlert(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetData();
  }, []);

  const openInGoogleMaps = () => {
    if (selectedMarker) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedMarker.latitude},${selectedMarker.longitude}`;
      Linking.openURL(url);
    }
  };

  const openInWaze = () => {
    if (selectedMarker) {
      const url = `https://waze.com/ul?ll=${selectedMarker.latitude},${selectedMarker.longitude}&navigate=yes`;
      Linking.openURL(url);
    }
  };

  return (
    <>
      <Header isLeft={true} navigation={navigation} title={'Tareas'} />
      <View style={styles.priorityContainer}>
        <View style={[styles.priorityBox, { backgroundColor: colorsTheme.rojo }]}>
          <Text style={styles.priorityText}>Alta</Text>
        </View>
        <View style={[styles.priorityBox, { backgroundColor: colorsTheme.amarillo }]}>
          <Text style={[styles.priorityText, { color: "black" }]}>Media</Text>
        </View>
        <View style={[styles.priorityBox, { backgroundColor: colorsTheme.verdeClaro }]}>
          <Text style={[styles.priorityText, { color: "black" }]}>Baja</Text>
        </View>
      </View>
      {
        loading ?
          (
            <View style={{ justifyContent: 'center', alignItems: 'center', height: height * 0.5 }}>
              <ActivityIndicator size="large" color={colorsTheme.naranja} />
            </View>
          ) : (
            <View style={styles.containerMap}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={{
                  latitude: checkpoints.length > 0 ? checkpoints[0].latitude : 14.634915, // Latitud predeterminada
                  longitude: checkpoints.length > 0 ? checkpoints[0].longitude : -90.506882, // Longitud predeterminada
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              >
                {checkpoints.length > 0 &&
                  checkpoints.map((checkpoint, i) => (
                    <Marker
                      key={`${i}-${checkpoint.idCustomer}`}
                      coordinate={{ latitude: checkpoint.latitude, longitude: checkpoint.longitude }}
                      pinColor={checkpoint.color}
                      title={`Tendero/a ${checkpoint.name}`}
                      description={`Descripción: ${checkpoint.description}`}
                      onPress={() => handleMarkerPress(checkpoint)}
                    />
                  ))}
              </MapView>

              {checkpoints.length === 0 && (
                <View style={{ position: 'absolute', top: 20, left: 20 }}>
                  <Text style={{ color: colorsTheme.gris80, fontSize: 16 }}>
                    No hay puntos para mostrar en el mapa.
                  </Text>
                </View>
              )}

              {selectedMarker && (
                <View style={styles.markerDetailsContainer}>
                  <Text style={[styles.markerDetailsTextBold, { fontSize: 20, marginBottom: 8 }]}>Datos del Tendero</Text>
                  <Text style={styles.markerDetailsText}>Tendero/a: <Text style={styles.markerDetailsTextBold}>{selectedMarker.name}</Text></Text>
                  <Text style={styles.markerDetailsText}>DPI: <Text style={styles.markerDetailsTextBold}>{selectedMarker.dpi}</Text></Text>
                  <Text style={styles.markerDetailsText}>Teléfono: <Text style={styles.markerDetailsTextBold}>{selectedMarker.phone}</Text></Text>
                  <Text style={styles.markerDetailsText}>Comunidad: <Text style={styles.markerDetailsTextBold}>{selectedMarker.community.name}</Text></Text>

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={openInGoogleMaps}>
                      <Text style={styles.buttonText}>Abrir en Google Maps</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={openInWaze}>
                      <Text style={styles.buttonText}>Abrir en Waze</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )
      }

      <AwesomeAlert
        show={showAlert}
        onDismiss={() => setShowAlert(false)}
        title={titleAlert}
        message={messageAlert}
      />
    </>
  );
};

const styles = StyleSheet.create({
  containerMap: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerDetailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 5,
  },
  markerDetailsText: {
    fontSize: 14,
    marginBottom: 4,
    color: colorsTheme.gris80
  },
  markerDetailsTextBold: {
    fontWeight: 'bold',
    color: colorsTheme.negro
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
    backgroundColor: colorsTheme.naranja,
  },
  priorityBox: {
    width: 80,
    height: 30,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  button: {
    backgroundColor: colorsTheme.naranja,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default VisitScreen;
