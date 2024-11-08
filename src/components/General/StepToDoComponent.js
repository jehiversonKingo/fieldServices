import React from 'react';
import {Text, View, TouchableOpacity} from 'react-native';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import {colorsTheme} from '../../configurations/configStyle';

const StepToDoComponent = ({item, index, onClickValidate, onClickStep}) => {
  return (
    <TouchableOpacity
      onPress={onClickStep}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth:1,
        borderColor: colorsTheme.naranja,
        margin: 5,
        borderRadius: 5,
      }}
      key={index}
    >
     
      <View style={{justifyContent: 'center', padding: 20}}>
        <Text style={{color: colorsTheme.naranja, fontWeight:'bold', fontSize: 15}}>{item.step.name}</Text>
      </View>
      
      <TouchableOpacity
        onPress={onClickValidate}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colorsTheme.naranja,
          paddingVertical: 10,
          paddingHorizontal: 15,
          borderBottomRightRadius: 5,
          borderTopRightRadius: 5,
        }}
      >
        <FontAwesome5Icon
          name={'camera'}
          color={colorsTheme.blanco}
          size={20}
        />
        <Text style={{color: colorsTheme.blanco, marginLeft: 10}}>Validar</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default StepToDoComponent;
