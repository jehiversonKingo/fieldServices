import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {colorsTheme} from '../../configurations/configStyle';

const ButtonProgressStep = ({text = 'text', onPress = () => {}, type, disabled=false}) => (
  <View style={{flex: 1, marginTop: 45}}>
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={
        type === 'right' || type === 'complete'
          ? {...styles.buttonRightTextStyle, backgroundColor: disabled? colorsTheme.naranja60 : colorsTheme.naranja}
          : styles.buttonLeftTextStyle
      }>
      <Text style={styles.textStyle}>{text}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  buttonRightTextStyle: {
    backgroundColor: colorsTheme.naranja,
    borderRadius: 5,
    padding: 15,
    position: 'absolute',
    right: 0,
  },
  buttonLeftTextStyle: {
    backgroundColor: colorsTheme.naranja,
    borderRadius: 5,
    padding: 15,
    position: 'absolute',
    left: 0,
  },
  textStyle: {
    color: colorsTheme.blanco,
  },
});

export default ButtonProgressStep;
