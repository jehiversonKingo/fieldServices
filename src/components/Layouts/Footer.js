import React from 'react';
import {View, StyleSheet, Image} from 'react-native';
import {Dimensions} from 'react-native';

import Logo from '../../../assets/img/logoBlanco.png';
import {colorsTheme} from '../../configurations/configStyle';

const {width} = Dimensions.get('screen');

const Footer = ({styleCustomer}) => {
  return (
    <View style={{...styleCustomer, ...styles.containerLogo}}>
      <Image source={Logo} style={styles.imgLogo} />
    </View>
  );
};

const styles = StyleSheet.create({
  containerLogo: {
    backgroundColor: colorsTheme.naranja,
    flexDirection: 'row',
    height: 80,
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgLogo: {
    height: 50,
    width: 150,
  },
});

export default Footer;
