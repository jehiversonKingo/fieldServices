import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Dimensions, Text } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { StyleSheet } from 'react-native';

// Components
import Header from '../../../components/Layouts/Header';
import { getTasks } from '../../../services/task.services';
import {handleGPSCoordinates} from "../../../functions/fncGeneral";
import { colorsTheme } from '../../../configurations/configStyle';

const { height } = Dimensions.get('screen');


const VisitScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [checkpoints, setcheckpoints] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  
  const handleMarkerPress = (marker) => {
    setSelectedMarker(marker === selectedMarker ? null : marker);
  };

  const handleGetData = async() => {
    const checkpointsCustomer = [];
    const getTaskData = await getTasks();
    getTaskData.forEach(ticket => {
      const coordinates = handleGPSCoordinates(ticket.task.ticket.customer.gps);
      let color = "";
      switch(ticket.task.idTaskPriority){
        case 1:
           color = colorsTheme.rojo 
          break;
        case 2:
          color = colorsTheme.amarillo
          break;
        case 3:
          color = colorsTheme.verdeClaro
          break;
      }
      checkpointsCustomer.push({
        idCustomer: ticket.task.ticket.customer.idCustomer,
        name:ticket.task.ticket.customer.name,
        dpi:ticket.task.ticket.customer.dpi,
        phone:ticket.task.ticket.customer.phone,
        community:ticket.task.ticket.customer.community,
        description:ticket.task.ticket.description,
        latitude:coordinates[0],
        longitude:coordinates[1],
        color
      });
      console.log("Datos Visitas",checkpointsCustomer);
    });
    setcheckpoints(checkpointsCustomer)
    setLoading(false);
  };

  useEffect(() =>{
    handleGetData();
  },[]);

  return (
    <>
      <Header isLeft={true} navigation={navigation} title={'Listado De Ordenes'} />
      <View style={styles.priorityContainer}>
        <View style={[styles.priorityBox, { backgroundColor: colorsTheme.rojo }]}>
          <Text style={styles.priorityText}>Alta</Text>
        </View>
        <View style={[styles.priorityBox, { backgroundColor: colorsTheme.amarillo }]}>
          <Text style={[styles.priorityText, {color:"black"}]}>Media</Text>
        </View>
        <View style={[styles.priorityBox, { backgroundColor: colorsTheme.verdeClaro}]}>
          <Text style={[styles.priorityText, {color:"black"}]}>Baja</Text>
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
              latitude: checkpoints[0].latitude,
              longitude: checkpoints[0].longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
          {checkpoints.map(checkpoint => (
                <Marker
                  key={checkpoint.idCustomer}
                  coordinate={{ latitude: checkpoint.latitude, longitude: checkpoint.longitude }}
                  pinColor={checkpoint.color}
                  title={`Tendero/a ${checkpoint.name}`}
                  description={`Description ${checkpoint.description}`}
                  onPress={() => handleMarkerPress(checkpoint)}
                />
              ))}
            </MapView>

            {/* Mostrar detalles del marcador seleccionado */}
            {selectedMarker && (
              <View style={styles.markerDetailsContainer}>
              <Text style={[styles.markerDetailsTextBold, {fontSize: 20, marginBottom: 8}]}>Datos del Tendero</Text>
              <Text style={styles.markerDetailsText}>{`Tendero/a: `}
                <Text style={styles.markerDetailsTextBold}>{selectedMarker.name}</Text>
              </Text>
              <Text style={styles.markerDetailsText}>{`DPI: `}
                <Text style={styles.markerDetailsTextBold}>{selectedMarker.dpi}</Text>
              </Text>
              <Text style={styles.markerDetailsText}>{`Teléfono: `}
                <Text style={styles.markerDetailsTextBold}>{selectedMarker.phone}</Text>
              </Text>
              <Text style={styles.markerDetailsText}>{`Comunidad: `}
                <Text style={styles.markerDetailsTextBold}>{selectedMarker.community.name}</Text>
              </Text>
            </View>
            )}
        </View>
        )
      }
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
  markerDetailsTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  markerDetailsText: {
    fontSize: 14,
    marginBottom: 4,
  },
  markerDetailsTextBold: {
    fontWeight: 'bold',
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
});

export default VisitScreen;
