import React from 'react';
import {Dimensions, View} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import {
  StyleSheet,
} from 'react-native';

//Components
import Header from '../../../components/Layouts/Header';
import {colorsTheme} from '../../../configurations/configStyle';

const {width, height} = Dimensions.get('screen');


const VisitScreen = ({navigation, route}) => {

  return (
    <>
      <Header
        isLeft={true}
        navigation={navigation}
        title={'Listado De Ordenes'}
      />
      <View style={styles.containerMap}>
      <MapView
        provider={PROVIDER_GOOGLE} // remove if not using Google Maps
        style={styles.map}
        region={{
          latitude: 15.5000,
          longitude: -90.2500,
          latitudeDelta: 0.0922, // Adjust as needed
          longitudeDelta: 0.0421, // Adjust as needed
        }}
      >
      </MapView>
     </View>
    </>
  );
};

const styles = StyleSheet.create({
  containerMap:{
    flex:1
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default VisitScreen;
