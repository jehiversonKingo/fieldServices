import React from 'react';
import { Dimensions, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { StyleSheet } from 'react-native';

// Components
import Header from '../../../components/Layouts/Header';
import { colorsTheme } from '../../../configurations/configStyle';

const { width, height } = Dimensions.get('screen');

const VisitScreen = ({ navigation, route }) => {
  const checkpoints = [
    { id: 1, name:"Ciudad de Guatemala", latitude: 14.64072, longitude: -90.2501 },
    { id: 2, name:"Mixco", latitude: 14.63077, longitude: -90.60711 },
    { id: 3, name:"Villa Nueva", latitude: 14.52512, longitude: -90.58544 },
    { id: 4, name:"Escuintla", latitude: 14.3009, longitude: -90.78581 },
    { id: 5, name:"Puerto Barrios", latitude: 15.72778, longitude: -88.59444 },
    { id: 6, name:"Chiquimula", latitude: 14.8, longitude: -89.54583 },
    { id: 7, name:"Cobán", latitude: 15.47083, longitude: -90.37083 },
    { id: 8, name:"San Pedro", latitude: 14.96807, longitude: -91.76172 },
    { id: 9, name:"Santiago", latitude: 14.6351, longitude: -90.67654 },
    { id: 10, name:"Zacapa", latitude: 14.97222, longitude: -89.53056 },
  ];

  return (
    <>
      <Header isLeft={true} navigation={navigation} title={'Listado De Ordenes'} />
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
              key={checkpoint.id}
              coordinate={{ latitude: checkpoint.latitude, longitude: checkpoint.longitude }}
              title={`Checkpoint ${checkpoint.name}`}
              description={`Description ${checkpoint.name}`}
            />
          ))}
        </MapView>
      </View>
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
});

export default VisitScreen;
