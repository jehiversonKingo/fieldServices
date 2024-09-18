import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { colorsTheme } from '../../../configurations/configStyle';
import Header from '../../../components/Layouts/Header';

const menuItems = [
  { icon: 'cloud-upload', text: 'Sincronizar Tareas', screen: 'TaskOffline' },
  { icon: 'handshake-o', text: 'Handshake', screen: 'HandshakeServer' },
  { icon: 'refresh', text: 'Cargar Datos', screen: 'SyncDataScreen' },
];

const SyncListScreen = ({ navigation }) => {
  const RenderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bottomMenu}
      onPress={() => navigation.navigate(item.screen)}>
      <FontAwesome
        name={item.icon}
        color={colorsTheme.naranja}
        size={30}
        style={styles.icon}
      />
      <Text style={styles.text}>{item.text}</Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <Header
        isLeft={true}
        navigation={navigation}
        title={'Datos'}
      />
      <FlatList
        data={menuItems}
        numColumns={2}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <RenderMenuItem item={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  bottomMenu: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 10,
    padding:15,
    margin:10,
    backgroundColor: colorsTheme.blanco,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: colorsTheme.gris80,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 6,
    borderLeftColor: colorsTheme.naranja,
    borderLeftWidth:4,
  },
  icon: {
    paddingRight: 10,
  },
  text: {
    fontSize: 17,
    color: colorsTheme.gris80,
    fontWeight: '500',
  },
});

export default SyncListScreen;
