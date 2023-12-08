import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Header from '../../../components/Layouts/Header';
import { colorsTheme } from '../../../configurations/configStyle';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const { width, fontScale } = Dimensions.get('window');
const BankPayScreen = ({ navigation }) => {
  const options = [
    {
      id: 1,
      icon: 'money-check',
      size: 30,
      name: 'Voucher',
      redirect: 'VoucherScreen',
    },
    {
      id: 2,
      icon: 'money-check-alt',
      size: 30,
      name: 'Creditos',
      redirect: 'CreditListScreen',
    },
  ];
  const RenderOptions = ({ item }) => (
    <TouchableOpacity
      style={styles.bottomMenu}
      onPress={() => navigation.navigate(item.redirect)}>
      <FontAwesome5
        name={item.icon}
        color={colorsTheme.naranja}
        size={item.size}
        style={styles.bottomMenu.icon}
      />
      <Text
        style={{
          ...styles.bottomMenu.text,
          color: colorsTheme.gris80,
          fontWeight: '500',
          marginTop: -5,
        }}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView>
      <Header isLeft={true} navigation={navigation} />
      <View
        style={{
          felx: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          marginVertical: 10,
        }}>
        {options.map(item => (
          <RenderOptions key={item.id} item={item} />
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  buttons: {
    height: 45,
    width: width * 0.5,
    backgroundColor: colorsTheme.blanco,
    color: colorsTheme.negro,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
    borderWidth: 1,
    borderColor: colorsTheme.naranja,
    borderRadius: 8,
    marginBottom: 15,
  },
  bottomMenu: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 10,
    margin: 7,
    borderLeftColor: colorsTheme.naranja60,
    borderLeftWidth: 5,
    backgroundColor: colorsTheme.blanco,
    height: 85,
    justifyContent: 'center',
    alignItems: 'center',
    text: {
      fontSize: 17,
      color: colorsTheme.blanco,
      padding: 10,
      fontWeight: '700',
    },
    icon: {
      paddingRight: 15,
      color: colorsTheme.naranja,
    },
    shadowColor: colorsTheme.gris80,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 6,
  },
});

export default BankPayScreen;