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
        backgroundColor: colorsTheme.gris80,
        margin: 5,
        borderRadius: 10,
      }}
      key={index}>
      <View style={{justifyContent: 'center', margin: 10}}>
        <Text style={{color: colorsTheme.blanco}}>{item.step.name}</Text>
      </View>
      <View style={{justifyContent: 'center'}}>
        <TouchableOpacity
          onPress={onClickValidate}
          style={{
            backgroundColor: colorsTheme.verdeHybrico,
            paddingVertical: 5,
            borderBottomRightRadius: 10,
            borderTopEndRadius: 10,
          }}>
          <View style={{margin: 10, flexDirection: 'row'}}>
            <View style={{}}>
              <FontAwesome5Icon
                name={'camera'}
                color={colorsTheme.blanco}
                size={20}
              />
            </View>
            <View style={{marginLeft: 10}}>
              <Text style={{color: colorsTheme.blanco}}>Validar</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default StepToDoComponent;
