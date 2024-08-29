import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {colorsTheme} from '../../configurations/configStyle';

const ButtonProgressStep = ({text = 'text', onPress = () => {}, type}) => (
  <View style={{flex: 1, marginTop: 20}}>
    <TouchableOpacity
      onPress={onPress}
      style={
        type === 'right' || type === 'complete'
          ? styles.buttonRightTextStyle
          : styles.buttonLeftTextStyle
      }>
      <Text style={styles.textStyle}>{text}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  buttonRightTextStyle: {
    backgroundColor: colorsTheme.verdeHybrico,
    borderRadius: 5,
    padding: 15,
    position: 'absolute',
    right: 0,
  },
  buttonLeftTextStyle: {
    backgroundColor: colorsTheme.verdeHybrico,
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
